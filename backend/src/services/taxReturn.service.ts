import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { assertWorkspaceOwner } from './workspace.service';
import { TaxReturnStatus, TaxRegime, TaxReturnType } from '@prisma/client';

export const getTaxReturns = async (workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);
  return prisma.taxReturn.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
};

export const createTaxReturn = async (workspaceId: string, userId: string, data: {
  financialYear: string; returnType?: TaxReturnType; regime?: TaxRegime;
}) => {
  await assertWorkspaceOwner(workspaceId, userId);
  const assessmentYear = `${parseInt(data.financialYear.split('-')[0]) + 1}-${(parseInt(data.financialYear.split('-')[1]) + 1).toString().padStart(2, '0')}`;
  return prisma.taxReturn.create({
    data: {
      workspaceId,
      financialYear: data.financialYear,
      assessmentYear,
      returnType: data.returnType || 'ITR2',
      regime: data.regime || 'NEW',
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
  returnType: TaxReturnType; regime: TaxRegime; status: TaxReturnStatus;
}>) => {
  await getTaxReturn(returnId, userId);
  return prisma.taxReturn.update({ where: { id: returnId }, data });
};

// Income
export const getIncome = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.incomeEntry.findMany({ where: { taxReturnId: returnId } });
};

export const addIncome = async (returnId: string, userId: string, data: {
  incomeType: string; source: string; amount: number; tdsDeducted?: number; sourceDocumentId?: string; notes?: string;
}) => {
  await getTaxReturn(returnId, userId);
  return prisma.incomeEntry.create({
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
};

export const updateIncome = async (incomeId: string, userId: string, data: Partial<{
  source: string; amount: number; tdsDeducted: number; notes: string;
}>) => {
  const entry = await prisma.incomeEntry.findUnique({ where: { id: incomeId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!entry) throw new AppError('Income entry not found', 404, 'NOT_FOUND');
  if (entry.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.incomeEntry.update({ where: { id: incomeId }, data: data as any });
};

export const deleteIncome = async (incomeId: string, userId: string) => {
  const entry = await prisma.incomeEntry.findUnique({ where: { id: incomeId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!entry) throw new AppError('Income entry not found', 404, 'NOT_FOUND');
  if (entry.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.incomeEntry.delete({ where: { id: incomeId } });
};

// Deductions
export const getDeductions = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.deduction.findMany({ where: { taxReturnId: returnId } });
};

export const addDeduction = async (returnId: string, userId: string, data: {
  section: string; description: string; claimedAmount: number; sourceDocumentId?: string;
}) => {
  await getTaxReturn(returnId, userId);
  return prisma.deduction.create({
    data: {
      taxReturnId: returnId,
      section: data.section as any,
      description: data.description,
      claimedAmount: data.claimedAmount,
      sourceDocumentId: data.sourceDocumentId,
    },
  });
};

export const updateDeduction = async (deductionId: string, userId: string, data: Partial<{
  description: string; claimedAmount: number;
}>) => {
  const ded = await prisma.deduction.findUnique({ where: { id: deductionId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!ded) throw new AppError('Deduction not found', 404, 'NOT_FOUND');
  if (ded.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.deduction.update({ where: { id: deductionId }, data: data as any });
};

export const deleteDeduction = async (deductionId: string, userId: string) => {
  const ded = await prisma.deduction.findUnique({ where: { id: deductionId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!ded) throw new AppError('Deduction not found', 404, 'NOT_FOUND');
  if (ded.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.deduction.delete({ where: { id: deductionId } });
};
