import { describe, it, expect, vi } from 'vitest';
import { approveReturn } from '../review.service';
import { generateApprovalHash, CanonicalFinancialSnapshot } from '../../../utils/helpers';

const { mockPrisma } = vi.hoisted(() => {
  const mPrisma: any = {
    taxReturn: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    taxCalculation: {
      findFirst: vi.fn(),
    },
    validationIssue: {
      count: vi.fn(),
    },
    approval: {
      upsert: vi.fn(),
      create: vi.fn(({ data }: any) => data),
      updateMany: vi.fn(),
    },
  };
  mPrisma.$transaction = vi.fn(async (cbOrArr: any) => {
    if (typeof cbOrArr === 'function') {
      return cbOrArr(mPrisma);
    }
    return Promise.all(cbOrArr);
  });
  return { mockPrisma: mPrisma };
});

vi.mock('../../../config/prisma', () => ({
  default: mockPrisma,
}));

vi.mock('../../../services/taxReturn.service', () => ({
  getTaxReturn: vi.fn(),
}));

import { getTaxReturn } from '../../../services/taxReturn.service';

describe('Review Service: Approval Integrity Gate', () => {
  const userId = 'usr-123';
  const returnId = 'ret-456';
  const ipAddress = '192.168.1.1';

  it('rejects approval if return is still in DRAFT', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'DRAFT',
      regime: 'NEW',
    });

    await expect(approveReturn(returnId, userId, ipAddress)).rejects.toThrow('Return must be reviewed before approval');
  });

  it('rejects approval if return has unresolved CRITICAL validation issues', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
    });
    (mockPrisma.validationIssue.count as any).mockResolvedValue(2);

    await expect(approveReturn(returnId, userId, ipAddress)).rejects.toThrow('Cannot approve: unresolved critical issues remain');
  });

  it('rejects approval if return is in locked status (PROCESSING)', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'PROCESSING',
      regime: 'NEW',
    });
    (mockPrisma.validationIssue.count as any).mockResolvedValue(0);

    await expect(approveReturn(returnId, userId, ipAddress)).rejects.toThrow('Return must be reviewed before approval');
  });

  it('rejects approval if calculation is missing', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
    });
    (mockPrisma.validationIssue.count as any).mockResolvedValue(0);
    (mockPrisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
      assessmentYear: '2025-26',
      incomeEntries: [{ id: 'inc-1' }],
      deductions: [],
    });
    (mockPrisma.taxCalculation.findFirst as any).mockResolvedValue(null);

    await expect(approveReturn(returnId, userId, ipAddress)).rejects.toThrow('Tax calculation is required before approval');
  });

  it('rejects approval if calculation regime mismatches return regime', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'OLD',
    });
    (mockPrisma.validationIssue.count as any).mockResolvedValue(0);
    (mockPrisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'OLD',
      assessmentYear: '2025-26',
      incomeEntries: [{ id: 'inc-1' }],
      deductions: [],
    });
    (mockPrisma.taxCalculation.findFirst as any).mockResolvedValue({
      id: 'calc-1',
      regime: 'NEW', // mismatch!
      inputs: { incomeCount: 1, deductionCount: 0 },
    });

    await expect(approveReturn(returnId, userId, ipAddress)).rejects.toThrow('Calculation regime (NEW) does not match current return regime (OLD)');
  });

  it('rejects approval if calculation inputs count mismatches current data (stale calculation)', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
    });
    (mockPrisma.validationIssue.count as any).mockResolvedValue(0);
    (mockPrisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
      assessmentYear: '2025-26',
      incomeEntries: [{ id: 'inc-1' }, { id: 'inc-2' }], // 2 entries
      deductions: [],
    });
    (mockPrisma.taxCalculation.findFirst as any).mockResolvedValue({
      id: 'calc-1',
      regime: 'NEW',
      inputs: { incomeCount: 1, deductionCount: 0 }, // stale count: 1 vs 2
    });

    await expect(approveReturn(returnId, userId, ipAddress)).rejects.toThrow('Tax calculation is stale relative to current income/deduction entries');
  });

  it('successfully approves and binds canonical financial snapshot to approval hash', async () => {
    (getTaxReturn as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
    });
    (mockPrisma.validationIssue.count as any).mockResolvedValue(0);
    (mockPrisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId,
      status: 'USER_REVIEW',
      regime: 'NEW',
      assessmentYear: '2025-26',
      incomeEntries: [{ id: 'inc-1' }],
      deductions: [],
    });
    (mockPrisma.taxCalculation.findFirst as any).mockResolvedValue({
      id: 'calc-1',
      regime: 'NEW',
      ruleVersion: 'AY2025-26-v1',
      grossIncome: 1000000,
      totalDeductions: 75000,
      taxableIncome: 925000,
      taxLiability: 48750,
      totalTax: 50700,
      tdsDeducted: 50000,
      refundPayable: 700,
      inputs: { incomeCount: 1, deductionCount: 0 },
    });

    (mockPrisma.approval.create as any).mockImplementation(({ data }: any) => data);
    (mockPrisma.approval.upsert as any).mockImplementation(({ create }: any) => create);
    (mockPrisma.taxReturn.update as any).mockResolvedValue({ id: returnId, status: 'APPROVED' });

    const result = await approveReturn(returnId, userId, ipAddress, 'Approved by taxpayer');

    expect(result.approval).toBeDefined();
    expect(result.approval.approvalHash).toHaveLength(64);

    // Verify snapshot stored in notes
    const parsedNotes = JSON.parse(result.approval.notes as string);
    expect(parsedNotes.note).toBe('Approved by taxpayer');
    expect(parsedNotes.snapshot.taxableIncome).toBe(925000);
    expect(parsedNotes.snapshot.totalTax).toBe(50700);

    // Verify cryptographic integrity: recalculating hash from saved snapshot produces identical hash
    const recomputedHash = generateApprovalHash(parsedNotes.snapshot as CanonicalFinancialSnapshot);
    expect(recomputedHash).toBe(result.approval.approvalHash);
  });
});
