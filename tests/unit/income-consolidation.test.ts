import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consolidateIncome } from '../../backend/src/modules/consolidation/consolidation.service';
import prisma from '../../backend/src/config/prisma';

vi.mock('../../backend/src/config/prisma', () => ({
  default: {
    incomeEntry: { findMany: vi.fn() },
    document: { findMany: vi.fn() },
  },
}));

describe('Income Consolidation Unit Tests (Section 9: TC-INC-01 to TC-INC-10)', () => {
  const taxReturnId = 'tr-test-123';
  const userId = 'u-test-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-INC-01: Single income source (Salary ₹8,00,000)', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-1', incomeType: 'SALARY', amount: 800000, source: 'Form 16 TechCorp', tdsDeducted: 25000, sourceDocumentId: null }
    ]);
    (prisma.document.findMany as any).mockResolvedValue([]);

    const result = await consolidateIncome(taxReturnId, userId);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('SALARY');
    expect(result[0].amount).toBe(800000);
    expect(result[0].tds).toBe(25000);
  });

  it('TC-INC-02: Two income sources (Salary ₹8,00,000 + Bank Interest ₹25,000)', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-1', incomeType: 'SALARY', amount: 800000, source: 'TechCorp', tdsDeducted: 25000, sourceDocumentId: null },
      { id: 'inc-2', incomeType: 'OTHER_SOURCES', amount: 25000, source: 'SBI Savings', tdsDeducted: 0, sourceDocumentId: null }
    ]);
    (prisma.document.findMany as any).mockResolvedValue([]);

    const result = await consolidateIncome(taxReturnId, userId);
    expect(result).toHaveLength(2);
    const total = result.reduce((s, i) => s + i.amount, 0);
    expect(total).toBe(825000);
  });

  it('TC-INC-03: Multiple income sources (Raw Total ₹10,30,000)', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-1', incomeType: 'SALARY', amount: 800000, source: 'TechCorp', tdsDeducted: 25000, sourceDocumentId: null },
      { id: 'inc-2', incomeType: 'OTHER_SOURCES', amount: 25000, source: 'SBI Savings', tdsDeducted: 0, sourceDocumentId: null },
      { id: 'inc-3', incomeType: 'OTHER_SOURCES', amount: 35000, source: 'HDFC FD', tdsDeducted: 3500, sourceDocumentId: null },
      { id: 'inc-4', incomeType: 'HOUSE_PROPERTY', amount: 120000, source: 'Bengaluru Property', tdsDeducted: 0, sourceDocumentId: null },
      { id: 'inc-5', incomeType: 'OTHER', amount: 50000, source: 'Zerodha STCG', tdsDeducted: 0, sourceDocumentId: null },
    ]);
    (prisma.document.findMany as any).mockResolvedValue([]);

    const result = await consolidateIncome(taxReturnId, userId);
    expect(result).toHaveLength(5);
    const rawTotal = result.reduce((s, i) => s + i.amount, 0);
    expect(rawTotal).toBe(1030000);
  });

  it('TC-INC-04: No income entries returns empty consolidated list', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([]);
    (prisma.document.findMany as any).mockResolvedValue([]);

    const result = await consolidateIncome(taxReturnId, userId);
    expect(result).toHaveLength(0);
  });

  it('TC-INC-05: Deduplication of identical income records prevents double-counting', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-1', incomeType: 'SALARY', amount: 800000, source: 'Employer 1', tdsDeducted: 25000, sourceDocumentId: null },
      { id: 'inc-dup', incomeType: 'SALARY', amount: 800000, source: 'Employer 1 Duplicate', tdsDeducted: 25000, sourceDocumentId: null },
    ]);
    (prisma.document.findMany as any).mockResolvedValue([]);

    const result = await consolidateIncome(taxReturnId, userId);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(800000);
  });

  it('TC-INC-08 & TC-INC-09: Merging manual entry with document-extracted income with source traceability', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-manual', incomeType: 'HOUSE_PROPERTY', amount: 120000, source: 'Manual Rent Entry', tdsDeducted: 0, sourceDocumentId: null }
    ]);
    (prisma.document.findMany as any).mockResolvedValue([
      {
        id: 'doc-form16',
        name: 'Form16_Aarav.pdf',
        isVerified: true,
        extractedFields: [
          { fieldName: 'SALARY_INCOME', rawValue: '800000', normalizedValue: '800000', isVerified: true },
          { fieldName: 'TDS_DEDUCTED', rawValue: '25000', normalizedValue: '25000', isVerified: true },
        ]
      }
    ]);

    const result = await consolidateIncome(taxReturnId, userId);
    expect(result).toHaveLength(2);
    
    const manualItem = result.find(i => i.isManual === true);
    const extractedItem = result.find(i => i.isManual === false);

    expect(manualItem).toBeDefined();
    expect(manualItem?.amount).toBe(120000);
    expect(extractedItem).toBeDefined();
    expect(extractedItem?.amount).toBe(800000);
    expect(extractedItem?.source).toContain('Form16_Aarav.pdf');
  });
});
