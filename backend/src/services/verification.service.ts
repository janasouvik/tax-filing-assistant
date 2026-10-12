import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { getTaxReturn } from './taxReturn.service';

/**
 * Supported electronic verification methods for Indian Income Tax Returns.
 */
export const ALLOWED_VERIFICATION_METHODS = [
  'AADHAAR_OTP',
  'EVC_NETBANKING',
  'EVC_BANK_ACCOUNT',
  'EVC_DEMAT',
  'ITR_V',
] as const;

export type VerificationMethod = (typeof ALLOWED_VERIFICATION_METHODS)[number];

/**
 * Adapter representing the external Sandbox ERI E-Verification capabilities.
 * Currently, ERI product scopes and credentials are NOT available.
 * 
 * Safety Rule: This adapter is strictly blocked. No taxpayer passwords,
 * Aadhaar OTPs, or EVCs are ever accepted, stored, logged, or forwarded.
 */
export const sandboxEverifyAdapter = {
  generateEVC: async (_method: string): Promise<any> => {
    throw new AppError(
      'Verification unavailable: Sandbox ERI API test credentials and product scopes are blocked. Cannot contact government verification endpoints.',
      503,
      'PROVIDER_ACCESS_BLOCKED'
    );
  },
  verifyEVC: async (): Promise<any> => {
    throw new AppError(
      'Verification unavailable: Sandbox ERI API test credentials and product scopes are blocked. Cannot verify OTP.',
      503,
      'PROVIDER_ACCESS_BLOCKED'
    );
  },
};

/**
 * Initiates an e-verification workflow for a filed tax return.
 * 
 * State transitions:
 * - Requires return status === 'FILED'
 * - Allowed starting verificationStatus: 'UNVERIFIED', 'FAILED' (retry allowed)
 * - Transitions to 'PENDING' during request processing
 * - On provider access failure (PROVIDER_ACCESS_BLOCKED): Restores original verification status ('UNVERIFIED' or 'FAILED').
 *   The taxpayer's return is NEVER marked FAILED merely because the provider is unavailable.
 */
export const initiateVerification = async (returnId: string, userId: string, method: string) => {
  const taxReturn = await getTaxReturn(returnId, userId);

  // 1. Validate Filing Status
  if (taxReturn.status !== 'FILED') {
    throw new AppError('Only successfully filed returns can be e-verified.', 400, 'INVALID_FILING_STATE');
  }

  // 2. Validate Method
  if (!ALLOWED_VERIFICATION_METHODS.includes(method as VerificationMethod)) {
    throw new AppError(
      `Invalid verification method: ${method}. Supported methods: ${ALLOWED_VERIFICATION_METHODS.join(', ')}`,
      400,
      'INVALID_METHOD'
    );
  }

  // 3. Validate Verification State Transitions
  if (taxReturn.verificationStatus === 'VERIFIED') {
    throw new AppError('This return has already been verified.', 409, 'ALREADY_VERIFIED');
  }

  if (taxReturn.verificationStatus === 'PENDING') {
    throw new AppError('A verification attempt is currently pending for this return.', 409, 'VERIFICATION_IN_PROGRESS');
  }

  if (taxReturn.verificationStatus === 'UNKNOWN') {
    throw new AppError('This return has an unknown verification status and requires reconciliation before re-attempting.', 409, 'VERIFICATION_UNKNOWN');
  }

  const originalVerStatus = taxReturn.verificationStatus; // 'UNVERIFIED' or 'FAILED'

  // 4. Atomic Claim - Prevent concurrent verification attempts
  const claimResult = await prisma.taxReturn.updateMany({
    where: {
      id: returnId,
      status: 'FILED',
      verificationStatus: originalVerStatus,
    },
    data: { verificationStatus: 'PENDING' },
  });

  if (claimResult.count === 0) {
    throw new AppError('Verification conflict. Another process is modifying this return.', 409, 'CONCURRENCY_CONFLICT');
  }

  // 5. Create Durable Verification Attempt
  const attempt = await prisma.verificationAttempt.create({
    data: {
      taxReturnId: returnId,
      method,
      status: 'INITIATED',
    },
  });

  try {
    // 6. Contact Provider Adapter
    await sandboxEverifyAdapter.generateEVC(method);

    return {
      message: 'Verification OTP / EVC initiated successfully.',
      attemptId: attempt.id,
      method,
      status: 'PENDING',
    };
  } catch (error: any) {
    // 7. Recovery on failure
    // Record the operational failure in VerificationAttempt
    try {
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'FAILED',
          errorCategory: error.code || 'PROVIDER_ACCESS_BLOCKED',
          errorDetail: error.message,
          completedAt: new Date(),
        },
      });
    } catch (attErr: any) {
      console.error('[Verification Recovery Error] Failed to update attempt log:', attErr);
    }

    // Restore original verification status using conditional rollback
    // Taxpayer verification is NEVER marked FAILED merely because provider is unavailable
    try {
      const rollbackResult = await prisma.taxReturn.updateMany({
        where: {
          id: returnId,
          verificationStatus: 'PENDING',
        },
        data: { verificationStatus: originalVerStatus },
      });

      if (rollbackResult.count === 0) {
        console.warn(`[Verification Recovery Warning] Return ${returnId} was not in PENDING state during rollback.`);
      }
    } catch (dbErr: any) {
      console.error(`[Verification Recovery Error] Database rollback failed for return ${returnId}:`, dbErr);
    }

    throw error;
  }
};

/**
 * Submits an OTP / EVC for a pending verification attempt.
 * 
 * Safety Rules:
 * - Validates format without logging, serializing, or storing the OTP secret.
 * - VERIFIED can ONLY be set after validating an authoritative success response from an authorized provider.
 * - If provider access is blocked: records attempt operational failure, but does NOT mark taxpayer verification as FAILED.
 * - If provider fails ambiguously (network/timeout/5xx): transitions to 'UNKNOWN' (never VERIFIED).
 * - Only genuine provider rejections (e.g. 400/422 definitive rejection contract) mark verificationStatus as 'FAILED'.
 * - Preserves filing status strictly as 'FILED'.
 */
export const submitVerificationOtp = async (returnId: string, userId: string, otp: string) => {
  const taxReturn = await getTaxReturn(returnId, userId);

  // 1. Validate Filing Status
  if (taxReturn.status !== 'FILED') {
    throw new AppError('Only successfully filed returns can be e-verified.', 400, 'INVALID_FILING_STATE');
  }

  // 2. Validate Verification Status
  if (taxReturn.verificationStatus === 'VERIFIED') {
    throw new AppError('This return has already been verified.', 409, 'ALREADY_VERIFIED');
  }

  if (taxReturn.verificationStatus !== 'PENDING') {
    throw new AppError('No pending verification request exists for this return.', 400, 'NO_PENDING_VERIFICATION');
  }

  // 3. Format Validation (Strictly without logging the secret)
  if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
    throw new AppError('Invalid OTP format. Must be a 6-digit numeric code.', 400, 'INVALID_OTP');
  }

  // 4. Locate Active Attempt
  const attempt = await prisma.verificationAttempt.findFirst({
    where: { taxReturnId: returnId, status: 'INITIATED' },
    orderBy: { requestedAt: 'desc' },
  });

  try {
    // 5. Dispatch to Provider (Never log OTP)
    const verifyRes = await sandboxEverifyAdapter.verifyEVC();

    // 6. Authoritative Success Validation
    // VERIFIED can ONLY be set after validating an authoritative success response from an authorized provider
    if (!verifyRes || verifyRes.status !== 'SUCCESS' || !verifyRes.verificationReference) {
      throw new AppError('Provider response was missing authoritative verification confirmation.', 502, 'MALFORMED_PROVIDER_RESPONSE');
    }

    if (attempt) {
      await prisma.verificationAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'SUCCESS',
          providerReference: verifyRes.verificationReference,
          completedAt: new Date(),
        },
      });
    }

    await prisma.taxReturn.updateMany({
      where: { id: returnId, verificationStatus: 'PENDING' },
      data: { verificationStatus: 'VERIFIED' },
    });

    return {
      message: 'Return verified successfully.',
      verificationStatus: 'VERIFIED',
    };
  } catch (error: any) {
    const isBlocked = error.code === 'PROVIDER_ACCESS_BLOCKED';
    const isAmbiguous = !isBlocked && (error.isNetworkError || (error.statusCode && error.statusCode >= 500 && error.statusCode <= 599));

    if (isBlocked) {
      // 1. PROVIDER UNAVAILABLE:
      // Record operational failure in VerificationAttempt, but do NOT mark taxpayer verification as FAILED
      if (attempt) {
        try {
          await prisma.verificationAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'FAILED',
              errorCategory: 'PROVIDER_ACCESS_BLOCKED',
              errorDetail: error.message,
              completedAt: new Date(),
            },
          });
        } catch (attErr: any) {
          console.error('[Verification Recovery Error] Failed to update attempt:', attErr);
        }
      }
      // Status remains PENDING so taxpayer can retry when provider is available
    } else if (isAmbiguous) {
      // 3. AMBIGUOUS OUTCOMES:
      // Maintain UNKNOWN for genuinely ambiguous outcomes. Never mark VERIFIED.
      if (attempt) {
        try {
          await prisma.verificationAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'UNKNOWN',
              errorCategory: error.code || 'TIMEOUT_ERROR',
              errorDetail: error.message,
              completedAt: new Date(),
            },
          });
        } catch (attErr: any) {
          console.error('[Verification Recovery Error] Failed to update attempt:', attErr);
        }
      }

      try {
        await prisma.taxReturn.updateMany({
          where: { id: returnId, verificationStatus: 'PENDING' },
          data: { verificationStatus: 'UNKNOWN' },
        });
      } catch (dbErr: any) {
        console.error('[Verification Recovery Error] Failed to update verification status to UNKNOWN:', dbErr);
      }
    } else {
      // 2. GENUINE VERIFICATION FAILURE:
      // Only set FAILED when provider contract definitively establishes verification rejection
      if (attempt) {
        try {
          await prisma.verificationAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'FAILED',
              errorCategory: error.code || 'PROVIDER_REJECTION',
              errorDetail: error.message,
              completedAt: new Date(),
            },
          });
        } catch (attErr: any) {
          console.error('[Verification Recovery Error] Failed to update attempt:', attErr);
        }
      }

      try {
        await prisma.taxReturn.updateMany({
          where: { id: returnId, verificationStatus: 'PENDING' },
          data: { verificationStatus: 'FAILED' },
        });
      } catch (dbErr: any) {
        console.error('[Verification Recovery Error] Failed to update verification status to FAILED:', dbErr);
      }
    }

    throw error;
  }
};

/**
 * Reconciles a verification stuck in 'UNKNOWN' or abandoned 'PENDING'.
 */
export const reconcileVerificationStatus = async (returnId: string, userId: string) => {
  const taxReturn = await getTaxReturn(returnId, userId);

  if (taxReturn.verificationStatus !== 'UNKNOWN' && taxReturn.verificationStatus !== 'PENDING') {
    throw new AppError('Only returns in UNKNOWN or PENDING verification state can be reconciled.', 400, 'INVALID_RECONCILIATION_STATE');
  }

  const attempt = await prisma.verificationAttempt.findFirst({
    where: { taxReturnId: returnId },
    orderBy: { requestedAt: 'desc' },
  });

  if (!attempt) {
    // If no attempt was dispatched, safely restore to UNVERIFIED
    await prisma.taxReturn.updateMany({
      where: { id: returnId, verificationStatus: taxReturn.verificationStatus },
      data: { verificationStatus: 'UNVERIFIED' },
    });
    return {
      message: 'Abandoned verification reset to UNVERIFIED.',
      verificationStatus: 'UNVERIFIED',
    };
  }

  // Provider access blocked: Cannot query remote status
  throw new AppError(
    'Reconciliation unavailable: Sandbox ERI API test credentials and product scopes are blocked. Please verify return status directly on incometax.gov.in.',
    503,
    'RECONCILIATION_UNAVAILABLE'
  );
};

/**
 * Retrieves the verification history and attempt logs for an owned tax return.
 */
export const getVerificationHistory = async (returnId: string, userId: string) => {
  const taxReturn = await getTaxReturn(returnId, userId);

  const attempts = await prisma.verificationAttempt.findMany({
    where: { taxReturnId: returnId },
    orderBy: { requestedAt: 'desc' },
    select: {
      id: true,
      taxReturnId: true,
      method: true,
      status: true,
      requestedAt: true,
      completedAt: true,
      providerReference: true,
      errorCategory: true,
      errorDetail: true,
    },
  });

  return {
    taxReturnId: returnId,
    filingStatus: taxReturn.status,
    verificationStatus: taxReturn.verificationStatus,
    attempts,
  };
};
