import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export const workspaceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['INDIVIDUAL', 'SME']),
  pan: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const workspacePatchSchema = workspaceSchema.partial();

export const businessSchema = z.object({
  name: z.string().min(1),
  registrationType: z.string().optional(),
  gstin: z.string().optional(),
  tan: z.string().optional(),
  pan: z.string().optional(),
  industry: z.string().optional(),
  address: z.string().optional(),
});

export const taxReturnSchema = z.object({
  financialYear: z.string().regex(/^\d{4}-\d{2}$/),
  returnType: z.enum(['ITR1', 'ITR2', 'ITR3', 'ITR4']).optional(),
  regime: z.enum(['OLD', 'NEW']).optional(),
});

export const incomeSchema = z.object({
  incomeType: z.enum(['SALARY', 'HOUSE_PROPERTY', 'CAPITAL_GAINS_SHORT', 'CAPITAL_GAINS_LONG', 'BUSINESS', 'OTHER_SOURCES', 'FREELANCE']),
  source: z.string().min(1),
  amount: z.number().positive(),
  tdsDeducted: z.number().min(0).optional(),
  sourceDocumentId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const deductionSchema = z.object({
  section: z.enum(['SEC_80C', 'SEC_80CCD1', 'SEC_80CCD1B', 'SEC_80CCD2', 'SEC_80D', 'SEC_80DD', 'SEC_80DDB', 'SEC_80E', 'SEC_80EE', 'SEC_80EEA', 'SEC_80G', 'SEC_80GG', 'SEC_80TTA', 'SEC_80TTB', 'SEC_80U', 'SEC_24B', 'STANDARD_DEDUCTION', 'HRA']),
  description: z.string().min(1),
  claimedAmount: z.number().positive(),
  sourceDocumentId: z.string().uuid().optional(),
});

export const expenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
  vendor: z.string().optional(),
  isDeductible: z.boolean().optional(),
  gstAmount: z.number().min(0).optional(),
  invoiceNumber: z.string().optional(),
});

export const transactionSchema = z.object({
  date: z.string().datetime(),
  description: z.string().min(1),
  amount: z.number(),
  type: z.string().min(1),
  category: z.string().optional(),
  reference: z.string().optional(),
});

export const copilotMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  taxReturnId: z.string().uuid().optional(),
});

export const copilotConversationSchema = z.object({
  title: z.string().optional(),
  taxReturnId: z.string().uuid().optional(),
});

export const issueUpdateSchema = z.object({
  status: z.enum(['OPEN', 'RESOLVED', 'DISMISSED']).optional(),
  notes: z.string().optional(),
});
