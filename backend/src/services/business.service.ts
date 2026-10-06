import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { assertWorkspaceOwner } from './workspace.service';

export const getBusinesses = async (workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);
  return prisma.business.findMany({ where: { workspaceId } });
};

export const createBusiness = async (workspaceId: string, userId: string, data: {
  name: string; registrationType?: string; gstin?: string; tan?: string; pan?: string;
  industry?: string; address?: string;
}) => {
  await assertWorkspaceOwner(workspaceId, userId);
  return prisma.business.create({ data: { ...data, workspaceId } });
};

export const getBusiness = async (businessId: string, userId: string) => {
  const biz = await prisma.business.findUnique({ where: { id: businessId }, include: { workspace: true } });
  if (!biz) throw new AppError('Business not found', 404, 'NOT_FOUND');
  if (biz.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return biz;
};

export const updateBusiness = async (businessId: string, userId: string, data: Partial<{
  name: string; gstin: string; tan: string; pan: string; industry: string; address: string;
}>) => {
  await getBusiness(businessId, userId);
  return prisma.business.update({ where: { id: businessId }, data });
};

export const deleteBusiness = async (businessId: string, userId: string) => {
  await getBusiness(businessId, userId);
  return prisma.business.delete({ where: { id: businessId } });
};

// Financial data
export const getExpenses = async (businessId: string, userId: string) => {
  await getBusiness(businessId, userId);
  return prisma.expense.findMany({ where: { businessId }, orderBy: { date: 'desc' } });
};

export const addExpense = async (businessId: string, userId: string, data: {
  category: string; description: string; amount: number; date: string;
  vendor?: string; isDeductible?: boolean; gstAmount?: number; invoiceNumber?: string;
}) => {
  await getBusiness(businessId, userId);
  return prisma.expense.create({
    data: {
      businessId,
      ...data,
      date: new Date(data.date),
      amount: data.amount,
    },
  });
};

export const updateExpense = async (expenseId: string, userId: string, data: Partial<{
  category: string; description: string; amount: number; vendor: string; isDeductible: boolean;
}>) => {
  const exp = await prisma.expense.findUnique({ where: { id: expenseId }, include: { business: { include: { workspace: true } } } });
  if (!exp) throw new AppError('Expense not found', 404, 'NOT_FOUND');
  if (exp.business.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.expense.update({ where: { id: expenseId }, data: data as any });
};

export const deleteExpense = async (expenseId: string, userId: string) => {
  const exp = await prisma.expense.findUnique({ where: { id: expenseId }, include: { business: { include: { workspace: true } } } });
  if (!exp) throw new AppError('Expense not found', 404, 'NOT_FOUND');
  if (exp.business.workspace.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return prisma.expense.delete({ where: { id: expenseId } });
};

export const getTransactions = async (businessId: string, userId: string) => {
  await getBusiness(businessId, userId);
  return prisma.transaction.findMany({ where: { businessId }, orderBy: { date: 'desc' } });
};

export const addTransaction = async (businessId: string, userId: string, data: {
  date: string; description: string; amount: number; type: string; category?: string; reference?: string;
}) => {
  await getBusiness(businessId, userId);
  return prisma.transaction.create({ data: { businessId, ...data, date: new Date(data.date) } });
};

export const getFinancialSummary = async (businessId: string, userId: string) => {
  await getBusiness(businessId, userId);
  const [expenses, transactions] = await Promise.all([
    prisma.expense.aggregate({ where: { businessId }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { businessId } }),
  ]);
  const revenue = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = Number(expenses._sum.amount || 0);
  return {
    revenue,
    totalExpenses,
    grossProfit: revenue - totalExpenses,
    transactionCount: transactions.length,
  };
};
