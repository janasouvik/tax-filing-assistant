import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { getTaxReturn, getIncome, getDeductions } from './taxReturn.service';
import { mapToSandboxItr } from './itr.mapper';
import { authenticateSandbox, loginEri, prepareItrJson, validateItr, submitItr, getFilingStatus, ProviderError } from './sandbox.service';

/**
 * Orchestrates the full ITR filing workflow: Data validation, Mappings, Sandbox calls, and DB persistence.
 */
export const executeItrFiling = async (returnId: string, userId: string) => {
  // 1. Validate Ownership and Current State
  const taxReturn = await getTaxReturn(returnId, userId);
  
  if (taxReturn.status === 'FILED') {
    throw new AppError('This tax return has already been filed.', 400, 'ALREADY_FILED');
  }

  if (taxReturn.status === 'PROCESSING') {
    throw new AppError('This tax return is currently being processed by the provider.', 409, 'SUBMISSION_IN_PROGRESS');
  }

  if (taxReturn.status === 'SUBMISSION_UNKNOWN') {
    throw new AppError('This tax return has an unknown submission status and requires manual reconciliation.', 409, 'SUBMISSION_UNKNOWN');
  }

  // Prevent superseded or invalidated approvals from authorizing filing
  if (typeof (prisma as any)?.approval?.findFirst === 'function') {
    const activeApproval = await (prisma as any).approval.findFirst({
      where: { taxReturnId: returnId, status: 'ACTIVE' },
    });
    const anyApproval = await (prisma as any).approval.findFirst({
      where: { taxReturnId: returnId },
    });
    if (anyApproval && !activeApproval) {
      throw new AppError('The previous approval has been superseded or invalidated. Re-approval is required before filing.', 422, 'APPROVAL_SUPERSEDED');
    }
  }

  // Allowed starting states for filing
  const allowedStates = ['DRAFT', 'VALIDATION_REQUIRED', 'READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED', 'SUBMISSION_FAILED'];
  if (!allowedStates.includes(taxReturn.status)) {
     throw new AppError(`Cannot file return from state: ${taxReturn.status}`, 400, 'INVALID_STATE');
  }

  const originalStatus = taxReturn.status;

  // 2. Prevent Concurrent Submissions (Atomic Claim)
  const claimResult = await prisma.taxReturn.updateMany({
    where: { 
      id: returnId, 
      status: originalStatus // Ensures it hasn't changed since we read it
    },
    data: { status: 'PROCESSING' }
  });

  if (claimResult.count === 0) {
    throw new AppError('Filing conflict. Another process is modifying this return.', 409, 'CONCURRENCY_CONFLICT');
  }

  // Create a durable filing attempt log
  const attempt = await prisma.filingAttempt.create({
    data: {
      taxReturnId: returnId,
      status: 'DISPATCHED'
    }
  });

  let submitRes;
  let isSimulation = false;
  
  try {
    // 3. Fetch Data
    const incomes = await getIncome(returnId, userId);
    const deductions = await getDeductions(returnId, userId);

    // Fetch taxpayer profile if available in workspace
    let taxpayerProfile: any = null;
    if (taxReturn.workspaceId && typeof (prisma as any)?.taxpayerProfile?.findUnique === 'function') {
      taxpayerProfile = await (prisma as any).taxpayerProfile.findUnique({
        where: { workspaceId: taxReturn.workspaceId },
        include: { panVerification: true }
      });
    }

    // 4. Transform to Sandbox ITR Schema
    const payload = mapToSandboxItr(taxReturn, incomes, deductions, {
      profile: taxpayerProfile,
      bankAccounts: (taxReturn.metadata as any)?.bankAccounts || (taxReturn.metadata as any)?.bank_accounts
    });

    // 5. Authenticate (ERI flow)
    const sandboxToken = await authenticateSandbox();
    const itdToken = await loginEri();

    // 6. Provider Execution Steps
    await prepareItrJson(payload, sandboxToken, payload.reportYear);
    await validateItr(payload, itdToken);
    
    // 7. Final Submission
    submitRes = await submitItr(payload, itdToken);
    isSimulation = submitRes?.data?.is_mock === true || (process.env.SANDBOX_BASE_URL?.includes('test-api') ?? false);
    
  } catch (error: any) {
    let nextStatus: any = originalStatus;
    
    // Structured error classification using ProviderError
    // PROVISIONAL: Official Sandbox ERI contracts & ITD error schemas are pending.
    if (error instanceof ProviderError) {
      if (error.step === 'submitItr') {
        // Error occurred DURING submission dispatch
        if (error.isNetworkError || (error.statusCode && error.statusCode >= 500 && error.statusCode <= 599)) {
          // Ambiguous outcome: submission request was dispatched but response was lost or timed out.
          // May have been accepted by ITD; NEVER retry automatically without manual or provider reconciliation.
          nextStatus = 'SUBMISSION_UNKNOWN';
        } else if (error.statusCode === 400 || error.statusCode === 422) {
          // Definitive provider / schema rejection post-dispatch
          nextStatus = 'SUBMISSION_FAILED';
        } else {
          // Conservative fallback for unclassified status codes during dispatch
          nextStatus = 'SUBMISSION_UNKNOWN';
        }
      } else {
        // Definitive pre-dispatch failure (auth, prepare, validate, or mapper).
        // Return never reached final submission dispatch; safely restore original status.
        nextStatus = originalStatus;
      }
    } else {
      // Internal or unhandled error occurring before submission dispatch.
      // Safely restore original status.
      nextStatus = originalStatus;
    }

    // Persist attempt failure in the log
    try {
      await prisma.filingAttempt.update({
        where: { id: attempt.id },
        data: {
          status: nextStatus === 'SUBMISSION_UNKNOWN' ? 'UNKNOWN' : 'FAILED',
          errorCategory: error instanceof ProviderError ? `PROVIDER_${error.step.toUpperCase()}_ERROR` : 'INTERNAL_ERROR',
          errorDetail: error.message,
          respondedAt: new Date()
        }
      });
    } catch (attemptErr: any) {
      console.error(`[Filing Recovery Error] Failed to update FilingAttempt ${attempt.id}:`, attemptErr);
    }

    // Conditionally update TaxReturn only if it is still in PROCESSING state
    try {
      const rollbackResult = await prisma.taxReturn.updateMany({
        where: { 
          id: returnId, 
          status: 'PROCESSING' 
        },
        data: { 
          status: nextStatus,
          metadata: {
            ...(typeof taxReturn.metadata === 'object' && taxReturn.metadata !== null ? (taxReturn.metadata as Record<string, any>) : {}),
            lastFilingError: error.message
          }
        }
      });

      if (rollbackResult.count === 0) {
        console.warn(`[Filing Recovery Warning] Return ${returnId} was not in PROCESSING state during error recovery; status update to ${nextStatus} skipped to avoid overwriting concurrent changes.`);
      }
    } catch (dbErr: any) {
      console.error(`[Filing Recovery Error] Database update failed during status recovery for return ${returnId}:`, dbErr);
    }

    throw new AppError(`Filing failed: ${error.message}`, 502, 'FILING_PROVIDER_ERROR');
  }

  // 8. Validate Provider Success Response
  if (!submitRes || !submitRes.data || !submitRes.data.acknowledgement_number) {
    try {
      await prisma.filingAttempt.update({
        where: { id: attempt.id },
        data: { status: 'UNKNOWN', errorCategory: 'MALFORMED_SUCCESS_RESPONSE', respondedAt: new Date() }
      });
    } catch (attemptErr: any) {
      console.error(`[Filing Recovery Error] Failed to update FilingAttempt ${attempt.id} for malformed response:`, attemptErr);
    }

    try {
      const rollbackResult = await prisma.taxReturn.updateMany({
        where: { id: returnId, status: 'PROCESSING' },
        data: { 
          status: 'SUBMISSION_UNKNOWN',
          metadata: {
            ...(typeof taxReturn.metadata === 'object' && taxReturn.metadata !== null ? (taxReturn.metadata as Record<string, any>) : {}),
            lastFilingError: 'Provider returned OK but response was missing acknowledgement_number.'
          }
        }
      });

      if (rollbackResult.count === 0) {
        console.warn(`[Filing Recovery Warning] Return ${returnId} was not in PROCESSING state during malformed response handling.`);
      }
    } catch (dbErr: any) {
      console.error(`[Filing Recovery Error] Database update failed during malformed response handling for return ${returnId}:`, dbErr);
    }

    throw new AppError('Submission succeeded but provider response was malformed. Manual reconciliation required.', 502, 'MALFORMED_PROVIDER_RESPONSE');
  }

  // 9. Persist to Attempt Log BEFORE updating TaxReturn
  // This guarantees we don't lose the ackNumber if the final update fails.
  await prisma.filingAttempt.update({
    where: { id: attempt.id },
    data: {
      status: 'SUCCESS',
      ackNumber: submitRes.data.acknowledgement_number,
      transactionId: submitRes.transaction_id,
      respondedAt: new Date(submitRes.timestamp || Date.now())
    }
  });

  const updateData: any = {
    status: 'FILED',
    ackNumber: submitRes.data.acknowledgement_number,
  };

  if (submitRes.transaction_id) {
    updateData.transactionId = submitRes.transaction_id;
  }
  if (submitRes.timestamp) {
    updateData.filedAt = new Date(submitRes.timestamp);
  }
  
  updateData.metadata = {
    ...(typeof taxReturn.metadata === 'object' && taxReturn.metadata !== null ? taxReturn.metadata : {}),
    isSimulation: isSimulation,
    provider: 'SANDBOX_ERI',
    lastFilingError: null
  };

  // 10. Final Persistence
  try {
    const updatedReturn = await prisma.taxReturn.update({
      where: { id: returnId },
      data: updateData
    });
    return updatedReturn;
  } catch (persistenceError: any) {
    // Database failure AFTER provider success. 
    // The DB remains locked in 'PROCESSING'. Do NOT rollback.
    // The ackNumber is safely stored in the durable FilingAttempt log!
    throw new AppError(`Submission successful but database persistence failed: ${persistenceError.message}. DO NOT RESUBMIT.`, 500, 'PERSISTENCE_FAILED_AFTER_SUBMISSION');
  }
};

/**
 * Reconciles a tax return locked in SUBMISSION_UNKNOWN or abandoned PROCESSING state.
 */
export const reconcileFilingStatus = async (returnId: string, userId: string) => {
  const taxReturn = await getTaxReturn(returnId, userId);
  
  if (taxReturn.status !== 'SUBMISSION_UNKNOWN' && taxReturn.status !== 'PROCESSING') {
    throw new AppError('Only returns in SUBMISSION_UNKNOWN or PROCESSING state can be reconciled.', 400, 'INVALID_RECONCILIATION_STATE');
  }

  // Look up the latest dispatch attempt
  const attempt = await prisma.filingAttempt.findFirst({
    where: { taxReturnId: returnId },
    orderBy: { dispatchedAt: 'desc' }
  });

  if (!attempt) {
    // If no attempt was ever dispatched, it was abandoned before external calls. Safe to unlock.
    return prisma.taxReturn.update({
      where: { id: returnId },
      data: { status: 'READY_FOR_REVIEW' }
    });
  }

  // In a real application with authorized ERI scopes, we would call getFilingStatus here:
  /*
  const itdToken = await loginEri();
  const providerStatus = await getFilingStatus(itdToken);
  // Match providerStatus with our attempt and update the DB accordingly
  */

  // Since ERI scopes are missing, we explicitly fail the automatic reconciliation
  throw new AppError('Reconciliation unavailable: ERI API test credentials and product scopes are blocked. Manual resolution required.', 503, 'RECONCILIATION_UNAVAILABLE');
};
