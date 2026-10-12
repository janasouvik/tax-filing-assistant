import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';
import { generateApprovalHash, CanonicalFinancialSnapshot } from '../../utils/helpers';

export const getReview = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.review.findMany({ where: { taxReturnId: returnId }, orderBy: { reviewedAt: 'desc' } });
};

export const createReview = async (returnId: string, userId: string, notes?: string) => {
  const ret = await getTaxReturn(returnId, userId);
  const criticalIssues = await prisma.validationIssue.count({
    where: { taxReturnId: returnId, severity: 'CRITICAL', status: 'OPEN' },
  });
  if (criticalIssues > 0) {
    throw new AppError(`Cannot review: ${criticalIssues} unresolved critical issue(s) remain`, 422, 'CRITICAL_ISSUES_REMAIN');
  }
  await prisma.taxReturn.update({ where: { id: returnId }, data: { status: 'USER_REVIEW' } });
  return prisma.review.create({ data: { taxReturnId: returnId, reviewedBy: userId, notes, status: 'IN_REVIEW' } });
};

export const approveReturn = async (returnId: string, userId: string, ipAddress: string, notes?: string) => {
  const ret = await getTaxReturn(returnId, userId);

  // Approval gate checks
  if (['DRAFT', 'PROCESSING'].includes(ret.status)) {
    throw new AppError('Return must be reviewed before approval', 422, 'NOT_READY');
  }

  const criticalIssues = await prisma.validationIssue.count({
    where: { taxReturnId: returnId, severity: 'CRITICAL', status: 'OPEN' },
  });
  if (criticalIssues > 0) {
    throw new AppError('Cannot approve: unresolved critical issues remain', 422, 'CRITICAL_ISSUES_REMAIN');
  }

  const timestamp = new Date().toISOString();

  const [approval] = await prisma.$transaction(async (tx) => {
    // Acquire row-level lock on TaxReturn to serialize concurrent operations
    if (typeof tx?.$queryRaw === 'function') {
      await tx.$queryRaw`SELECT id FROM "TaxReturn" WHERE id = ${returnId} FOR UPDATE`;
    }

    // Re-verify current return within transaction
    const currentReturn = await tx.taxReturn.findUnique({
      where: { id: returnId },
      include: { incomeEntries: true, deductions: true },
    });

    if (!currentReturn) throw new AppError('Tax return not found', 404, 'NOT_FOUND');
    if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(currentReturn.status)) {
      throw new AppError(`Cannot approve return in locked status: ${currentReturn.status}`, 403, 'LOCKED_RETURN');
    }
    if (currentReturn.status === 'APPROVED') {
      throw new AppError('Tax return has already been approved', 409, 'ALREADY_APPROVED');
    }

    const calculation = await tx.taxCalculation.findFirst({
      where: { taxReturnId: returnId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!calculation) throw new AppError('Tax calculation is required before approval', 422, 'NO_CALCULATION');

    if (calculation.regime !== currentReturn.regime) {
      throw new AppError(`Calculation regime (${calculation.regime}) does not match current return regime (${currentReturn.regime})`, 422, 'STALE_CALCULATION');
    }

    const inputs = calculation.inputs as any;
    if (
      inputs?.incomeCount !== currentReturn.incomeEntries.length ||
      inputs?.deductionCount !== currentReturn.deductions.length
    ) {
      throw new AppError('Tax calculation is stale relative to current income/deduction entries', 422, 'STALE_CALCULATION');
    }

    const snapshot: CanonicalFinancialSnapshot = {
      taxReturnId: returnId,
      userId,
      assessmentYear: currentReturn.assessmentYear,
      regime: currentReturn.regime,
      ruleVersion: calculation.ruleVersion,
      grossIncome: Number(calculation.grossIncome),
      totalDeductions: Number(calculation.totalDeductions),
      taxableIncome: Number(calculation.taxableIncome),
      taxLiability: Number(calculation.taxLiability),
      totalTax: Number(calculation.totalTax),
      tdsDeducted: Number(calculation.tdsDeducted),
      refundPayable: Number(calculation.refundPayable),
      calculationId: calculation.id,
      timestamp,
    };

    const approvalHash = generateApprovalHash(snapshot);
    const notesPayload = JSON.stringify({
      note: notes || 'Return approved',
      snapshot,
    });

    // Supersede any existing ACTIVE approval for audit traceability
    if (typeof tx?.approval?.updateMany === 'function') {
      await tx.approval.updateMany({
        where: { taxReturnId: returnId, status: 'ACTIVE' },
        data: {
          status: 'SUPERSEDED',
          invalidatedAt: new Date(),
          invalidationReason: 'Superseded by new approval',
        },
      });
    }

    const approvalRecord = await tx.approval.create({
      data: {
        taxReturnId: returnId,
        approvedBy: userId,
        ipAddress,
        approvalHash,
        notes: notesPayload,
        status: 'ACTIVE',
      },
    });

    await tx.taxReturn.update({ where: { id: returnId }, data: { status: 'APPROVED' } });

    return [approvalRecord];
  });

  return { approval, message: 'Return approved successfully. Note: Filing to ITD requires a real government integration which is not yet active.' };
};

