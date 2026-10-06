import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';
import { IssueSeverity, IssueStatus } from '@prisma/client';

export const runValidation = async (returnId: string, userId: string) => {
  const ret = await getTaxReturn(returnId, userId);
  const [income, deductions, documents] = await Promise.all([
    prisma.incomeEntry.findMany({ where: { taxReturnId: returnId } }),
    prisma.deduction.findMany({ where: { taxReturnId: returnId } }),
    prisma.document.findMany({ where: { taxReturnId: returnId } }),
  ]);

  // Clear old issues
  await prisma.validationIssue.deleteMany({ where: { taxReturnId: returnId } });

  const issues: { code: string; title: string; description: string; severity: IssueSeverity; field?: string }[] = [];

  // Rule: income required
  if (income.length === 0) {
    issues.push({ code: 'NO_INCOME', title: 'No income entries', description: 'At least one income source is required to file your return.', severity: 'CRITICAL', field: 'income' });
  }

  // Rule: salary needs Form 16
  const hasSalary = income.some((i) => i.incomeType === 'SALARY');
  const hasForm16 = documents.some((d) => d.category === 'FORM_16' && d.status === 'VERIFIED');
  if (hasSalary && !hasForm16) {
    issues.push({ code: 'MISSING_FORM16', title: 'Form 16 not uploaded or verified', description: 'You have salary income but Form 16 is not verified. Please upload and verify your Form 16.', severity: 'WARNING', field: 'documents' });
  }

  // Rule: large 80C deduction without docs
  const total80C = deductions.filter((d) => d.section === 'SEC_80C').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const hasInvestmentDocs = documents.some((d) => d.category === 'INVESTMENT_PROOF');
  if (total80C > 50000 && !hasInvestmentDocs) {
    issues.push({ code: 'MISSING_INVESTMENT_PROOF', title: '80C deduction without investment proof', description: `You have claimed ₹${total80C.toLocaleString()} under Section 80C but no investment proof documents are attached.`, severity: 'WARNING', field: 'deductions' });
  }

  // Rule: 80C limit
  if (total80C > 150000) {
    issues.push({ code: '80C_LIMIT_EXCEEDED', title: 'Section 80C limit exceeded', description: `Section 80C allows a maximum deduction of ₹1,50,000. You have claimed ₹${total80C.toLocaleString()}.`, severity: 'CRITICAL', field: 'deductions' });
  }

  // Rule: negative income
  for (const inc of income) {
    if (Number(inc.amount) <= 0) {
      issues.push({ code: 'INVALID_INCOME_AMOUNT', title: 'Invalid income amount', description: `Income entry "${inc.source}" has an invalid amount.`, severity: 'CRITICAL', field: 'income' });
    }
  }

  // Create issues in DB
  if (issues.length > 0) {
    await prisma.validationIssue.createMany({
      data: issues.map((i) => ({ ...i, taxReturnId: returnId })),
    });
  }

  // Update readiness and status
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const newStatus = criticalCount > 0 ? 'VALIDATION_REQUIRED' : 'READY_FOR_REVIEW';
  await prisma.taxReturn.update({ where: { id: returnId }, data: { status: newStatus as any } });

  return { issueCount: issues.length, criticalCount, status: newStatus };
};

export const getValidationResult = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  const issues = await prisma.validationIssue.findMany({ where: { taxReturnId: returnId }, orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }] });
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL' && i.status === 'OPEN').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING' && i.status === 'OPEN').length;
  return { issues, criticalCount, warningCount, isReady: criticalCount === 0 };
};

export const getIssues = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.validationIssue.findMany({ where: { taxReturnId: returnId }, orderBy: { severity: 'desc' } });
};

export const updateIssue = async (issueId: string, userId: string, data: { status?: IssueStatus }) => {
  const issue = await prisma.validationIssue.findUnique({ where: { id: issueId }, include: { taxReturn: { include: { workspace: true } } } });
  if (!issue) throw new AppError('Issue not found', 404, 'NOT_FOUND');
  if (issue.taxReturn.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.validationIssue.update({
    where: { id: issueId },
    data: { ...data, resolvedAt: data.status === 'RESOLVED' ? new Date() : undefined },
  });
};

export const resolveIssue = async (issueId: string, userId: string) =>
  updateIssue(issueId, userId, { status: 'RESOLVED' });
