import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { assertWorkspaceOwner } from './workspace.service';
import { TaxReturnStatus, TaxRegime, TaxReturnType, VerificationStatus } from '@prisma/client';

export const getTaxReturns = async (workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);
  return prisma.taxReturn.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
};

export const createTaxReturn = async (workspaceId: string, userId: string, data: {
  financialYear?: string;
  returnType?: TaxReturnType;
  regime?: TaxRegime;
  assessmentYear?: string;
  taxYear?: string;
  framework?: 'IT_ACT_1961' | 'IT_ACT_2025';
  metadata?: any;
}) => {
  await assertWorkspaceOwner(workspaceId, userId);

  let yearInput = data.taxYear || data.assessmentYear;
  if (!yearInput && data.financialYear) {
    const parts = data.financialYear.split('-');
    const nextStart = parseInt(parts[0], 10) + 1;
    const nextEnd = (parseInt(parts[1], 10) + 1).toString().padStart(2, '0');
    const computedYear = `${nextStart}-${nextEnd}`;
    if (computedYear === '2026-27') {
      yearInput = data.framework === 'IT_ACT_1961' ? 'AY 2026-27' : 'TY 2026-27';
    } else {
      yearInput = `AY ${computedYear}`;
    }
  }

  const { resolveYearSpecification } = await import('../modules/taxEngine/taxEngine.service');
  const yearInfo = resolveYearSpecification(yearInput, { framework: data.framework });

  let derivedFinancialYear = data.financialYear;
  if (!derivedFinancialYear && yearInput) {
    if (yearInput.includes('2024-25')) derivedFinancialYear = '2023-24';
    else if (yearInput.includes('2025-26')) derivedFinancialYear = '2024-25';
    else if (yearInput.includes('2026-27')) derivedFinancialYear = '2025-26';
    else derivedFinancialYear = '2025-26';
  }

  const existingMetadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {};
  const metadata = {
    ...existingMetadata,
    framework: yearInfo.framework,
    yearType: yearInfo.yearType,
    canonicalYear: yearInfo.canonicalYear,
    ruleVersion: yearInfo.ruleVersion,
  };

  return prisma.taxReturn.create({
    data: {
      workspaceId,
      financialYear: derivedFinancialYear || data.financialYear || '2025-26',
      assessmentYear: yearInfo.canonicalYear,
      returnType: data.returnType || 'ITR2',
      regime: data.regime || 'NEW',
      metadata,
    },
  });
};

export const getTaxReturn = async (returnId: string, userId: string) => {
  const ret = await prisma.taxReturn.findUnique({
    where: { id: returnId },
    include: { workspace: true },
  });
  if (!ret) throw new AppError('Tax return not found', 404, 'NOT_FOUND');
  if (ret.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return ret;
};

export const updateTaxReturn = async (returnId: string, userId: string, data: Partial<{
  returnType: TaxReturnType; regime: TaxRegime; status: TaxReturnStatus; verificationStatus: VerificationStatus;
  financialYear: string; assessmentYear: string; metadata: any;
}>) => {
  const current = await getTaxReturn(returnId, userId);

  if (data.status && data.status !== current.status) {
    const protectedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'SUBMISSION_FAILED', 'FILED'];
    
    if (protectedStates.includes(current.status)) {
      throw new AppError(`Cannot manually change status from a system-managed state (${current.status})`, 403, 'INVALID_STATE_TRANSITION');
    }
    
    if (protectedStates.includes(data.status)) {
      throw new AppError(`Cannot manually change status to a system-managed state (${data.status})`, 403, 'INVALID_STATE_TRANSITION');
    }
  }

  if (data.verificationStatus && data.verificationStatus !== current.verificationStatus) {
    const protectedVerStates = ['PENDING', 'VERIFIED', 'FAILED', 'UNKNOWN'];
    
    if (protectedVerStates.includes(current.verificationStatus)) {
      throw new AppError(`Cannot manually change verificationStatus from a system-managed state (${current.verificationStatus})`, 403, 'INVALID_STATE_TRANSITION');
    }
    
    if (protectedVerStates.includes(data.verificationStatus)) {
      throw new AppError(`Cannot manually change verificationStatus to a system-managed state (${data.verificationStatus})`, 403, 'INVALID_STATE_TRANSITION');
    }
  }

  const lockedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'];
  if (lockedStates.includes(current.status) && (data.regime || data.returnType || data.assessmentYear || data.financialYear)) {
    throw new AppError(`Cannot modify tax return in a locked state (${current.status})`, 403, 'LOCKED_RETURN');
  }

  const updateData: any = { ...data };

  if (data.assessmentYear || data.financialYear) {
    let yearInput = data.assessmentYear;
    if (!yearInput && data.financialYear) {
      const parts = data.financialYear.split('-');
      const computedYear = parts.length === 2 ? `${parseInt(parts[0], 10) + 1}-${parseInt(parts[1], 10) + 1}` : data.financialYear;
      const framework = (data.metadata as any)?.framework || (current.metadata as any)?.framework;
      if (framework === 'IT_ACT_2025') {
        yearInput = `TY ${computedYear}`;
      } else {
        yearInput = `AY ${computedYear}`;
      }
    }

    const { resolveYearSpecification } = await import('../modules/taxEngine/taxEngine.service');
    const resolutionMeta = data.assessmentYear
      ? (typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : undefined)
      : (typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : current.metadata);
    const yearInfo = resolveYearSpecification(yearInput, resolutionMeta);
    const mergedMeta = {
      ...(typeof current.metadata === 'object' && current.metadata !== null ? current.metadata : {}),
      ...(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {}),
      framework: yearInfo.framework,
      yearType: yearInfo.yearType,
      canonicalYear: yearInfo.canonicalYear,
      ruleVersion: yearInfo.ruleVersion,
    };
    updateData.assessmentYear = yearInfo.canonicalYear;
    updateData.metadata = mergedMeta;
  }

  const isFinancialChange =
    (data.regime && data.regime !== current.regime) ||
    (data.returnType && data.returnType !== current.returnType) ||
    (data.financialYear && data.financialYear !== current.financialYear) ||
    (updateData.assessmentYear && updateData.assessmentYear !== current.assessmentYear);

  if (isFinancialChange) {
    return prisma.$transaction(async (tx) => {
      await lockTaxReturnRow(returnId, tx);
      const updated = await tx.taxReturn.update({ where: { id: returnId }, data: updateData });
      await invalidateTaxCalculationsAndResetStatus(returnId, tx);
      return updated;
    });
  }

  return prisma.taxReturn.update({ where: { id: returnId }, data: updateData });
};

const lockTaxReturnRow = async (returnId: string, tx: any) => {
  if (typeof tx?.$queryRaw === 'function') {
    await tx.$queryRaw`SELECT id FROM "TaxReturn" WHERE id = ${returnId} FOR UPDATE`;
  }
};

export const invalidateTaxCalculationsAndResetStatus = async (
  taxReturnId: string,
  tx: any = prisma,
  reason: string = 'Financial data modified'
) => {
  await tx.taxCalculation.deleteMany({ where: { taxReturnId } });
  if (typeof tx?.approval?.updateMany === 'function') {
    try {
      await tx.approval.updateMany({
        where: { taxReturnId, status: 'ACTIVE' },
        data: {
          status: 'INVALIDATED',
          invalidatedAt: new Date(),
          invalidationReason: reason,
        },
      });
    } catch (err: any) {
      console.warn('Could not invalidate approvals (schema mismatch or missing column):', err?.message || err);
    }
  }
  await tx.taxReturn.updateMany({
    where: {
      id: taxReturnId,
      status: { in: ['READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED'] },
    },
    data: {
      status: 'DRAFT',
    },
  });
};

// Income
export const getIncome = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.incomeEntry.findMany({ where: { taxReturnId: returnId } });
};

export const addIncome = async (returnId: string, userId: string, data: {
  incomeType: string; source: string; amount: number; tdsDeducted?: number; sourceDocumentId?: string; notes?: string;
}) => {
  const ret = await getTaxReturn(returnId, userId);
  if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(ret.status)) {
    throw new AppError(`Cannot add income to a locked tax return (${ret.status})`, 403, 'LOCKED_RETURN');
  }
  return prisma.$transaction(async (tx) => {
    await lockTaxReturnRow(returnId, tx);
    const result = await tx.incomeEntry.create({
      data: {
        taxReturnId: returnId,
        incomeType: data.incomeType as any,
        source: data.source,
        amount: data.amount,
        tdsDeducted: data.tdsDeducted,
        sourceDocumentId: data.sourceDocumentId,
        notes: data.notes,
      },
    });
    await invalidateTaxCalculationsAndResetStatus(returnId, tx);
    return result;
  });
};

export const updateIncome = async (incomeId: string, userId: string, data: Partial<{
  source: string; amount: number; tdsDeducted: number; notes: string;
}>) => {
  const entry = await prisma.incomeEntry.findUnique({ where: { id: incomeId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!entry) throw new AppError('Income entry not found', 404, 'NOT_FOUND');
  if (entry.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(entry.taxReturn.status)) {
    throw new AppError(`Cannot modify income for a locked tax return (${entry.taxReturn.status})`, 403, 'LOCKED_RETURN');
  }
  return prisma.$transaction(async (tx) => {
    await lockTaxReturnRow(entry.taxReturnId, tx);
    const result = await tx.incomeEntry.update({ where: { id: incomeId }, data: data as any });
    await invalidateTaxCalculationsAndResetStatus(entry.taxReturnId, tx);
    return result;
  });
};

export const deleteIncome = async (incomeId: string, userId: string) => {
  const entry = await prisma.incomeEntry.findUnique({ where: { id: incomeId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!entry) throw new AppError('Income entry not found', 404, 'NOT_FOUND');
  if (entry.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(entry.taxReturn.status)) {
    throw new AppError(`Cannot delete income from a locked tax return (${entry.taxReturn.status})`, 403, 'LOCKED_RETURN');
  }
  return prisma.$transaction(async (tx) => {
    await lockTaxReturnRow(entry.taxReturnId, tx);
    const result = await tx.incomeEntry.delete({ where: { id: incomeId } });
    await invalidateTaxCalculationsAndResetStatus(entry.taxReturnId, tx);
    return result;
  });
};

// Deductions
export const getDeductions = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.deduction.findMany({ where: { taxReturnId: returnId } });
};

export const addDeduction = async (returnId: string, userId: string, data: {
  section: string; description: string; claimedAmount: number; sourceDocumentId?: string;
}) => {
  const ret = await getTaxReturn(returnId, userId);
  if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(ret.status)) {
    throw new AppError(`Cannot add deduction to a locked tax return (${ret.status})`, 403, 'LOCKED_RETURN');
  }
  return prisma.$transaction(async (tx) => {
    await lockTaxReturnRow(returnId, tx);
    const result = await tx.deduction.create({
      data: {
        taxReturnId: returnId,
        section: data.section as any,
        description: data.description,
        claimedAmount: data.claimedAmount,
        sourceDocumentId: data.sourceDocumentId,
      },
    });
    await invalidateTaxCalculationsAndResetStatus(returnId, tx);
    return result;
  });
};

export const updateDeduction = async (deductionId: string, userId: string, data: Partial<{
  description: string; claimedAmount: number;
}>) => {
  const ded = await prisma.deduction.findUnique({ where: { id: deductionId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!ded) throw new AppError('Deduction not found', 404, 'NOT_FOUND');
  if (ded.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(ded.taxReturn.status)) {
    throw new AppError(`Cannot modify deduction for a locked tax return (${ded.taxReturn.status})`, 403, 'LOCKED_RETURN');
  }
  return prisma.$transaction(async (tx) => {
    await lockTaxReturnRow(ded.taxReturnId, tx);
    const result = await tx.deduction.update({ where: { id: deductionId }, data: data as any });
    await invalidateTaxCalculationsAndResetStatus(ded.taxReturnId, tx);
    return result;
  });
};

export const deleteDeduction = async (deductionId: string, userId: string) => {
  const ded = await prisma.deduction.findUnique({ where: { id: deductionId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!ded) throw new AppError('Deduction not found', 404, 'NOT_FOUND');
  if (ded.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(ded.taxReturn.status)) {
    throw new AppError(`Cannot delete deduction from a locked tax return (${ded.taxReturn.status})`, 403, 'LOCKED_RETURN');
  }
  return prisma.$transaction(async (tx) => {
    await lockTaxReturnRow(ded.taxReturnId, tx);
    const result = await tx.deduction.delete({ where: { id: deductionId } });
    await invalidateTaxCalculationsAndResetStatus(ded.taxReturnId, tx);
    return result;
  });
};
