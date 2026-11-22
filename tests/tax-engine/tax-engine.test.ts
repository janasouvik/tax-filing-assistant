import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateTax,
  round288,
  getRules,
  resolveRuleVersion,
  resolveYearSpecification,
  compareRegimes,
} from '../../backend/src/modules/taxEngine/taxEngine.service';
import prisma from '../../backend/src/config/prisma';
import * as taxReturnService from '../../backend/src/services/taxReturn.service';
import * as consolidationService from '../../backend/src/modules/consolidation/consolidation.service';

vi.mock('../../backend/src/config/prisma', () => ({
  default: {
    taxRule: { findMany: vi.fn() },
    deduction: { findMany: vi.fn() },
    taxCalculation: { create: vi.fn(), deleteMany: vi.fn() },
    taxReturn: { update: vi.fn() },
  },
}));

vi.mock('../../backend/src/services/taxReturn.service', () => ({
  getTaxReturn: vi.fn(),
}));

vi.mock('../../backend/src/modules/consolidation/consolidation.service', () => ({
  consolidateIncome: vi.fn(),
}));

describe('Tax Engine Comprehensive Validation (Section 12, 13, 14)', () => {
  const returnId = 'tr-synth-001';
  const userId = 'u-synth-001';

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.taxRule.findMany as any).mockResolvedValue([]);
    (prisma.taxCalculation.create as any).mockImplementation(({ data }: any) => Promise.resolve(data));
  });

  // 1. Boundary & Rounding (Section 288A & 288B)
  describe('1. Section 288 Rounding Logic', () => {
    it('rounds to nearest 10 correctly', () => {
      expect(round288(1234)).toBe(1230);
      expect(round288(1235)).toBe(1240);
      expect(round288(1236)).toBe(1240);
      expect(round288(0)).toBe(0);
      expect(round288(-1235)).toBe(-1240);
    });
  });

  // 2. Assessment Year Resolution
  describe('2. Assessment Year Resolution & Rule Versions', () => {
    it('resolves AY 2024-25, AY 2025-26, and AY 2026-27 without cross-talk', () => {
      expect(resolveRuleVersion('AY 2024-25')).toBe('AY2024-25-v1');
      expect(resolveRuleVersion('AY 2025-26')).toBe('AY2025-26-v1');
      expect(resolveRuleVersion('AY 2026-27')).toBe('AY2026-27-v1');
      expect(resolveRuleVersion('TY 2026-27')).toBe('TY2026-27-v1');
    });

    it('rejects ambiguous year without framework', () => {
      expect(() => resolveRuleVersion('2026-27')).toThrow(/Ambiguous year identifier/);
    });

    it('rejects unsupported assessment years', () => {
      expect(() => resolveRuleVersion('2022-23')).toThrow(/Unsupported tax year/);
    });
  });

  // 3. Salary Income & Standard Deduction
  describe('3. Salary Income & Standard Deduction Handling', () => {
    it('calculates tax on salary with standard deduction (AY 2025-26 New Regime: ₹75,000 std ded)', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2025-26',
        tdsEntries: [],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 800000 },
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 },
      ]);

      const result = await calculateTax(returnId, userId, 'NEW');
      expect(result.ruleVersion).toBe('AY2025-26-v1');
      // Gross 800,000 - 75,000 standard deduction = 725,000 taxable income
      expect(result.taxableIncome).toBe(725000);
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.totalTax % 10).toBe(0); // Section 288B round
    });

    it('gives zero tax under New Regime when taxable income <= 7,00,000 due to Section 87A rebate', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2025-26',
        tdsEntries: [],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 775000 },
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 },
      ]);

      const result = await calculateTax(returnId, userId, 'NEW');
      expect(result.taxableIncome).toBe(700000);
      expect(result.taxLiability).toBe(0);
      expect(result.totalTax).toBe(0);
    });
  });

  // 4. Section 14: TDS, Advance Tax, and Refund Calculations
  describe('4. TDS Adjustment and Refund Scenarios (Section 14)', () => {
    it('Scenario A: Tax liability > TDS paid -> Tax Payable', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2025-26',
        tdsEntries: [],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1075000, tds: 20000 },
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 },
      ]);

      const result = await calculateTax(returnId, userId, 'NEW');
      expect(result.tdsDeducted).toBe(20000);
      // refundPayable is totalTax - tdsDeducted
      expect(result.refundPayable).toBe(result.totalTax - 20000);
    });

    it('Scenario B: Tax liability < TDS paid -> Potential Refund', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2025-26',
        tdsEntries: [],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1075000, tds: 60000 },
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 },
      ]);

      const result = await calculateTax(returnId, userId, 'NEW');
      expect(result.tdsDeducted).toBe(60000);
      // refundPayable will be negative (representing refund due)
      expect(result.refundPayable).toBe(result.totalTax - 60000);
    });

    it('Scenario C: Tax liability equals TDS paid -> Zero balance', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2025-26',
        tdsEntries: [{ amount: 0, deductor: 'Self' }],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'OTHER_SOURCES', amount: 300000 },
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);

      const result = await calculateTax(returnId, userId, 'NEW');
      expect(result.totalTax).toBe(0);
      expect(result.refundPayable).toBe(0);
    });
  });

  // 5. Section 13: Regime Comparison (Old vs New)
  describe('5. Regime Comparison (Old vs New)', () => {
    it('compares OLD and NEW regime on identical taxpayer data and suggests optimal regime', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2025-26',
        metadata: { canonicalYear: 'AY 2025-26' },
        tdsEntries: [],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1200000 },
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 },
        { section: '80C', claimedAmount: 150000 },
        { section: '80D', claimedAmount: 25000 },
      ]);

      const comparison = await compareRegimes(returnId, userId);
      expect(comparison).toHaveProperty('old');
      expect(comparison).toHaveProperty('new');
      expect(comparison).toHaveProperty('recommendation');
      expect(comparison).toHaveProperty('saving');
      expect(['OLD', 'NEW']).toContain(comparison.recommendation);
      expect(comparison.saving).toBeGreaterThanOrEqual(0);
    });
  });

  // 6. Multi-source Income Aggregation
  describe('6. Multi-source Income Aggregation', () => {
    it('aggregates Salary, Bank Interest, FD, Rental, and Capital Gains', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: 'AY 2026-27',
        tdsEntries: [],
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 800000 },
        { incomeType: 'OTHER_SOURCES', amount: 60000 }, // Bank + FD Interest
        { incomeType: 'HOUSE_PROPERTY', amount: 120000 }, // Rental
        { incomeType: 'OTHER', amount: 50000 }, // Capital Gains
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);

      const result = await calculateTax(returnId, userId, 'NEW');
      expect(result.grossIncome).toBe(1030000);
      expect(result.taxableIncome).toBeGreaterThan(0);
    });
  });
});
