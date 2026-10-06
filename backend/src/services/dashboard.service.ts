import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { assertWorkspaceOwner } from './workspace.service';

export const getDashboardIndividual = async (workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);

  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  if (!taxReturn) {
    return { taxReturn: null, income: [], deductions: [], calculation: null, issues: [], savings: [], documents: [], readinessScore: 0 };
  }

  const [income, deductions, calculation, issues, savings, documents] = await Promise.all([
    prisma.incomeEntry.findMany({ where: { taxReturnId: taxReturn.id } }),
    prisma.deduction.findMany({ where: { taxReturnId: taxReturn.id } }),
    prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id }, include: { lines: { orderBy: { sortOrder: 'asc' } } }, orderBy: { calculatedAt: 'desc' } }),
    prisma.validationIssue.findMany({ where: { taxReturnId: taxReturn.id }, orderBy: { severity: 'desc' } }),
    prisma.taxSaving.findMany({ where: { taxReturnId: taxReturn.id }, orderBy: { priority: 'asc' } }),
    prisma.document.findMany({ where: { taxReturnId: taxReturn.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return {
    taxReturn,
    income,
    deductions,
    calculation,
    issues,
    savings,
    documents,
    readinessScore: taxReturn.readinessScore,
    summary: {
      totalIncome: income.reduce((s, i) => s + Number(i.amount), 0),
      totalDeductions: deductions.reduce((s, d) => s + Number(d.claimedAmount), 0),
      totalTax: calculation ? Number(calculation.totalTax) : null,
      openIssues: issues.filter((i) => i.status === 'OPEN').length,
      criticalIssues: issues.filter((i) => i.severity === 'CRITICAL' && i.status === 'OPEN').length,
      documentsUploaded: documents.length,
      documentsVerified: documents.filter((d) => d.isVerified).length,
    },
  };
};

export const getDashboardSME = async (workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);

  const [business, complianceItems, notifications] = await Promise.all([
    prisma.business.findFirst({ where: { workspaceId } }),
    prisma.complianceItem.findMany({ where: { workspaceId }, orderBy: { dueDate: 'asc' } }),
    prisma.notification.findMany({ where: { workspaceId, isRead: false }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  let financialSummary: any = null;
  if (business) {
    const [expenses, transactions, documents] = await Promise.all([
      prisma.expense.aggregate({ where: { businessId: business.id }, _sum: { amount: true }, _count: true }),
      prisma.transaction.findMany({ where: { businessId: business.id } }),
      prisma.document.findMany({ where: { workspaceId } }),
    ]);

    const revenue = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = Number(expenses._sum.amount || 0);

    financialSummary = {
      business,
      revenue,
      totalExpenses,
      grossProfit: revenue - totalExpenses,
      transactionCount: transactions.length,
      documentsUploaded: documents.length,
    };
  }

  return {
    financialSummary,
    complianceItems,
    notifications,
    overdueCompliance: complianceItems.filter((c) => c.status === 'OVERDUE').length,
  };
};
