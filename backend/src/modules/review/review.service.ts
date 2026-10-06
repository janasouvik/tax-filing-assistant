import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';
import { getCalculation } from '../taxEngine/taxEngine.service';
import { generateApprovalHash } from '../../utils/helpers';

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

  const calculation = await getCalculation(returnId, userId);
  if (!calculation) throw new AppError('Tax calculation is required before approval', 422, 'NO_CALCULATION');

  const timestamp = new Date().toISOString();
  const approvalHash = generateApprovalHash(returnId, userId, timestamp);

  const [approval] = await prisma.$transaction([
    prisma.approval.upsert({
      where: { taxReturnId: returnId },
      create: { taxReturnId: returnId, approvedBy: userId, ipAddress, approvalHash, notes },
      update: { approvedBy: userId, ipAddress, approvalHash, notes, approvedAt: new Date() },
    }),
    prisma.taxReturn.update({ where: { id: returnId }, data: { status: 'APPROVED' } }),
  ]);

  return { approval, message: 'Return approved successfully. Note: Filing to ITD requires a real government integration which is not yet active.' };
};
