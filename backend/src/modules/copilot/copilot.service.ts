/**
 * Tax Copilot — RAG-based contextual assistant
 * AI explains/retrieves — it does NOT override the tax engine or approve returns.
 */
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { assertWorkspaceOwner } from '../../services/workspace.service';
import { config } from '../../config';

const buildContext = async (workspaceId: string, taxReturnId?: string): Promise<string> => {
  const parts: string[] = [];

  if (taxReturnId) {
    const [income, deductions, calculation, issues] = await Promise.all([
      prisma.incomeEntry.findMany({ where: { taxReturnId } }),
      prisma.deduction.findMany({ where: { taxReturnId } }),
      prisma.taxCalculation.findFirst({ where: { taxReturnId }, include: { lines: { orderBy: { sortOrder: 'asc' } } }, orderBy: { calculatedAt: 'desc' } }),
      prisma.validationIssue.findMany({ where: { taxReturnId, status: 'OPEN' } }),
    ]);

    if (income.length > 0) {
      parts.push(`INCOME ENTRIES:\n${income.map((i) => `- ${i.incomeType}: ₹${Number(i.amount).toLocaleString()} from ${i.source}`).join('\n')}`);
    }
    if (deductions.length > 0) {
      parts.push(`DEDUCTIONS:\n${deductions.map((d) => `- ${d.section}: ₹${Number(d.claimedAmount).toLocaleString()}`).join('\n')}`);
    }
    if (calculation) {
      parts.push(`LATEST TAX CALCULATION (${calculation.regime} REGIME):\n- Gross Income: ₹${Number(calculation.grossIncome).toLocaleString()}\n- Total Deductions: ₹${Number(calculation.totalDeductions).toLocaleString()}\n- Taxable Income: ₹${Number(calculation.taxableIncome).toLocaleString()}\n- Total Tax: ₹${Number(calculation.totalTax).toLocaleString()}\n- ${Number(calculation.refundPayable) >= 0 ? 'Refund' : 'Tax Payable'}: ₹${Math.abs(Number(calculation.refundPayable)).toLocaleString()}`);
    }
    if (issues.length > 0) {
      parts.push(`OPEN ISSUES:\n${issues.map((i) => `- [${i.severity}] ${i.title}: ${i.description}`).join('\n')}`);
    }
  }

  return parts.join('\n\n');
};

const getMockResponse = (question: string, context: string): string => {
  if (question.toLowerCase().includes('taxable income')) {
    return `Your taxable income is calculated from your Gross Total Income after subtracting eligible deductions under the applicable sections. ${context.includes('TAXABLE_INCOME') ? 'Based on your current data, please refer to the calculation lines for a detailed breakdown.' : 'Please complete your income and deduction entries, then run a calculation for a precise figure.'}`;
  }
  if (question.toLowerCase().includes('regime')) {
    return 'The New Tax Regime (115BAC) offers lower slab rates but does not allow most deductions. The Old Regime allows deductions under 80C, 80D, HRA, etc. Use the "Compare Regimes" feature to see which is better for your specific situation.';
  }
  if (question.toLowerCase().includes('80c')) {
    return 'Section 80C allows deductions up to ₹1,50,000 per year on investments in ELSS, PPF, NPS, life insurance premiums, home loan principal repayment, tuition fees, etc. This deduction is only available under the Old Tax Regime.';
  }
  return `I can help you understand your tax return. ${context ? 'Based on your current filing data, ' : ''}please ask me specific questions about your income, deductions, tax calculations, or validation issues. I provide explanations based on your actual workspace data and applicable tax rules. Note: For official tax advice, please consult a qualified CA.`;
};

export const getConversations = async (workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);
  return prisma.copilotConversation.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  });
};

export const createConversation = async (workspaceId: string, userId: string, data: { title?: string; taxReturnId?: string }) => {
  await assertWorkspaceOwner(workspaceId, userId);
  return prisma.copilotConversation.create({
    data: { workspaceId, title: data.title || 'New Conversation', taxReturnId: data.taxReturnId },
  });
};

export const getConversation = async (conversationId: string, workspaceId: string, userId: string) => {
  await assertWorkspaceOwner(workspaceId, userId);
  const conv = await prisma.copilotConversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conv || conv.workspaceId !== workspaceId) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  return conv;
};

export const sendMessage = async (
  conversationId: string, workspaceId: string, userId: string,
  content: string, taxReturnId?: string
) => {
  await assertWorkspaceOwner(workspaceId, userId);
  const conv = await prisma.copilotConversation.findUnique({ where: { id: conversationId } });
  if (!conv || conv.workspaceId !== workspaceId) throw new AppError('Conversation not found', 404, 'NOT_FOUND');

  // Save user message
  await prisma.copilotMessage.create({ data: { conversationId, role: 'user', content } });

  // Build workspace context
  const context = await buildContext(workspaceId, taxReturnId || conv.taxReturnId || undefined);

  let assistantContent: string;
  let sources: string[] = [];

  if (config.llm.apiKey && config.llm.provider === 'openai') {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: config.llm.apiKey });
      const systemPrompt = `You are Tax Copilot, an intelligent assistant for TaxPilot. You help users understand their Indian tax returns, deductions, income, and validation issues. 

CRITICAL RULES:
- You MUST only explain and retrieve information from the provided workspace context.
- You must NEVER invent or guess tax numbers.
- You must NEVER override the deterministic tax engine values.
- You must NEVER claim to file returns or verify documents.
- Always cite the source of information (e.g., "Based on your Form 16 upload" or "According to Finance Act 2024").
- Recommend consulting a CA for official tax advice.

WORKSPACE CONTEXT:
${context || 'No tax data available yet. Ask the user to complete their income and deduction entries.'}`;

      const response = await openai.chat.completions.create({
        model: config.llm.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content },
        ],
        max_tokens: 800,
      });
      assistantContent = response.choices[0].message.content || 'I could not generate a response.';
      sources = ['TaxPilot Rule Engine', 'Finance Act 2024', 'Workspace Data'];
    } catch {
      assistantContent = getMockResponse(content, context);
      sources = ['TaxPilot Rule Engine'];
    }
  } else {
    // Development mock response
    assistantContent = getMockResponse(content, context);
    sources = ['TaxPilot Rule Engine (Development Mode)'];
  }

  const assistantMessage = await prisma.copilotMessage.create({
    data: { conversationId, role: 'assistant', content: assistantContent, sources },
  });

  await prisma.copilotConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  return assistantMessage;
};

export const deleteConversation = async (conversationId: string, workspaceId: string, userId: string) => {
  await getConversation(conversationId, workspaceId, userId);
  return prisma.copilotConversation.delete({ where: { id: conversationId } });
};
