import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateTax, round288, getRules, resolveRuleVersion, resolveYearSpecification, compareRegimes } from '../taxEngine.service';
import prisma from '../../../config/prisma';
import * as taxReturnService from '../../../services/taxReturn.service';
import * as consolidationService from '../../consolidation/consolidation.service';

vi.mock('../../../config/prisma', () => ({
  default: {
    taxRule: { findMany: vi.fn() },
    deduction: { findMany: vi.fn() },
    taxCalculation: { create: vi.fn(), deleteMany: vi.fn() },
    taxReturn: { update: vi.fn() },
  }
}));

vi.mock('../../../services/taxReturn.service', () => ({
  getTaxReturn: vi.fn(),
}));

vi.mock('../../consolidation/consolidation.service', () => ({
  consolidateIncome: vi.fn(),
}));

describe('taxEngine.service - Authoritative Multi-Year Tax Engine', () => {
  const returnId = 'tr-test-1';
  const userId = 'u-test-1';

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: Return DB rules as empty array so engine uses verified STATUTORY_RULES fallback
    (prisma.taxRule.findMany as any).mockResolvedValue([]);
    (prisma.taxCalculation.create as any).mockImplementation(({ data }: any) => Promise.resolve(data));
  });

  // =========================================================================
  // SECTION 1: RULE VERSION RESOLUTION & YEAR PRESERVATION
  // =========================================================================
  describe('Rule Version Resolution and Historical Preservation', () => {
    it('resolves AY 2024-25 accurately to AY2024-25-v1', () => {
      expect(resolveRuleVersion('2024-25')).toBe('AY2024-25-v1');
      expect(resolveRuleVersion('AY 2024-25')).toBe('AY2024-25-v1');
      expect(resolveRuleVersion('AY2024-25')).toBe('AY2024-25-v1');
    });

    it('resolves AY 2025-26 accurately to AY2025-26-v1', () => {
      expect(resolveRuleVersion('2025-26')).toBe('AY2025-26-v1');
      expect(resolveRuleVersion('AY 2025-26')).toBe('AY2025-26-v1');
      expect(resolveRuleVersion('AY2025-26')).toBe('AY2025-26-v1');
    });

    it('resolves Tax Year 2026-27 accurately to TY2026-27-v1 under Income-tax Act, 2025', () => {
      expect(resolveRuleVersion('TY 2026-27')).toBe('TY2026-27-v1');
      expect(resolveRuleVersion('TY2026-27')).toBe('TY2026-27-v1');
      expect(resolveRuleVersion('Tax Year 2026-27')).toBe('TY2026-27-v1');
      expect(resolveRuleVersion('2026-27', { framework: 'IT_ACT_2025' })).toBe('TY2026-27-v1');
    });

    it('rejects bare 2026-27 as ambiguous when framework cannot be safely determined', () => {
      expect(() => resolveRuleVersion('2026-27')).toThrow("Ambiguous year identifier '2026-27'");
    });

    it('resolves AY 2026-27 to distinct AY2026-27-v1 under Income-tax Act, 1961', () => {
      expect(resolveRuleVersion('AY 2026-27')).toBe('AY2026-27-v1');
      expect(resolveRuleVersion('AY2026-27')).toBe('AY2026-27-v1');
      expect(resolveRuleVersion('Assessment Year 2026-27')).toBe('AY2026-27-v1');
      expect(resolveRuleVersion('2026-27', { framework: 'IT_ACT_1961' })).toBe('AY2026-27-v1');
      expect(resolveRuleVersion('2026-27', { yearType: 'ASSESSMENT_YEAR' })).toBe('AY2026-27-v1');
    });

    it('preserves AY2026-27 and TY2026-27 separation without cross-mapping', () => {
      expect(resolveRuleVersion('AY 2026-27')).toBe('AY2026-27-v1');
      expect(resolveRuleVersion('TY 2026-27')).toBe('TY2026-27-v1');
      expect(resolveRuleVersion('AY 2026-27')).not.toBe(resolveRuleVersion('TY 2026-27'));
    });

    it('rejects invalid TY framework applied to historical assessment years', () => {
      expect(() => resolveRuleVersion('TY 2024-25')).toThrow(
        "The Tax Year (TY) framework under Income-tax Act, 2025 is not applicable prior to 2026-27. Use 'AY 2024-25' or 'AY 2025-26'."
      );
      expect(() => resolveRuleVersion('TY 2025-26')).toThrow(
        "The Tax Year (TY) framework under Income-tax Act, 2025 is not applicable prior to 2026-27. Use 'AY 2024-25' or 'AY 2025-26'."
      );
    });

    it('explicitly rejects unsupported financial/assessment years without silent fallback', () => {
      expect(() => resolveRuleVersion('2023-24')).toThrow('Unsupported tax year or assessment year: 2023-24');
      expect(() => resolveRuleVersion('2027-28')).toThrow('Unsupported tax year or assessment year: 2027-28');
      expect(() => resolveRuleVersion('invalid')).toThrow('Unsupported tax year or assessment year: invalid');
    });

    it('throws AppError with code UNSUPPORTED_YEAR when calculating unsupported year', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: '2023-24'
      });
      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow('Unsupported tax year or assessment year: 2023-24');
    });

    it('throws AppError if assessmentYear and taxYear are completely missing', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        regime: 'NEW',
        assessmentYear: null,
        financialYear: null,
        metadata: null
      });
      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow('Assessment Year or Tax Year must be specified on the tax return.');
    });
  });

  // =========================================================================
  // SECTION 2: STATUTORY ROUNDING (SECTION 288A / 288B)
  // =========================================================================
  describe('Statutory Rounding (Section 288A/B logic)', () => {
    it('rounds positive numbers correctly at 50 paise / 5-rupee thresholds', () => {
      expect(round288(14.5)).toBe(20);
      expect(round288(14.49)).toBe(10);
      expect(round288(15.0)).toBe(20);
      expect(round288(14.0)).toBe(10);
      expect(round288(750014)).toBe(750010);
      expect(round288(750015)).toBe(750020);
      expect(round288(1200004)).toBe(1200000);
      expect(round288(1200005)).toBe(1200010);
    });

    it('rounds negative numbers (refunds) correctly while preserving sign and magnitude', () => {
      expect(round288(-15.0)).toBe(-20);
      expect(round288(-14.5)).toBe(-20);
      expect(round288(-14.49)).toBe(-10);
      expect(round288(-14.0)).toBe(-10);
      expect(round288(-22005)).toBe(-22010);
      expect(round288(-22004)).toBe(-22000);
    });

    it('returns 0 for 0 input', () => {
      expect(round288(0)).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 3: INPUT VALIDATION & UNSUPPORTED INCOME CATEGORIES
  // =========================================================================
  describe('Input Validation & Unsupported Income Categories', () => {
    it('rejects unsupported business income with UNSUPPORTED_INCOME code', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'BUSINESS', amount: 600000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);
      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow('Unsupported income category for deterministic calculation: BUSINESS');
    });

    it('rejects unsupported capital gains income', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'CAPITAL_GAINS', amount: 300000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);
      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow('Unsupported income category for deterministic calculation: CAPITAL_GAINS');
    });

    it('rejects negative salary income', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: -50000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);
      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow('Negative income is not allowed for SALARY');
    });

    it('rejects negative deduction claimed amounts', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 500000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: -10000 }
      ]);
      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow('Negative deduction amount is not allowed for 16(ia)');
    });

    it('allows negative income for House Property (Loss from House Property)', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'HOUSE_PROPERTY', amount: -150000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);
      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(0);
      expect(res.totalTax).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 4: HISTORICAL REGRESSION CASES (AY 2024-25 & AY 2025-26)
  // =========================================================================
  describe('Historical Tax Rules Regression', () => {
    it('calculates AY 2024-25 with ₹50,000 standard deduction and historical 115BAC slabs', async () => {
      // Gross 8,00,000 -> Std Ded 50,000 -> Taxable 7,50,000
      // Slabs 24-25: 0-3L (0), 3-6L (15k), 6-7.5L (15k) = 30,000.
      // Cess: 4% of 30,000 = 1,200. Total Tax: 31,200.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: '2024-25' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 800000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 50000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.ruleVersion).toBe('AY2024-25-v1');
      expect(res.taxableIncome).toBe(750000);
      expect(res.taxLiability).toBe(30000);
      expect(res.cess).toBe(1200);
      expect(res.totalTax).toBe(31200);
    });

    it('calculates AY 2025-26 with ₹75,000 standard deduction and Budget 2024 slabs', async () => {
      // Gross 7,75,010 -> Std Ded 75,000 -> Taxable 7,00,010
      // Slabs 25-26: 0-3L (0), 3-7L (20k), 7L-7,00,010 (1) = 20,001.
      // Rebate marginal relief: excess = 10 -> tax after rebate = 10.
      // Total tax = 10.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: '2025-26' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 775010 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.ruleVersion).toBe('AY2025-26-v1');
      expect(res.taxableIncome).toBe(700010);
      expect(res.taxLiability).toBe(10);
      expect(res.totalTax).toBe(10);
      expect(res.refundPayable).toBe(10);
    });
  });

  // =========================================================================
  // SECTION 5: TAX YEAR 2026-27 (INCOME-TAX ACT, 2025) SLAB BOUNDARIES
  // =========================================================================
  describe('Tax Year 2026-27 (Income-tax Act, 2025) - Slab Boundaries & Rates', () => {
    it('Boundary 1: Income up to ₹4,00,000 has Nil tax (exemption threshold)', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 475000 } // 4,75,000 - 75,000 std ded = 4,00,000 taxable
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.ruleVersion).toBe('TY2026-27-v1');
      expect(res.taxableIncome).toBe(400000);
      expect(res.taxLiability).toBe(0);
      expect(res.totalTax).toBe(0);
    });

    it('Boundary 2: Income at ₹8,00,000 (Slab 1 upper limit) qualifies for full rebate', async () => {
      // 0-4L: 0; 4L-8L (4L @ 5%): 20,000.
      // Full rebate u/s 87A (taxable <= 12L) brings tax to 0.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'OTHER_SOURCES', amount: 800000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(800000);
      expect(res.taxLiability).toBe(0); // 20000 tax minus 20000 rebate
      expect(res.totalTax).toBe(0);
    });

    it('Boundary 3: Income exactly at ₹12,00,000 (Rebate threshold limit) results in Nil tax', async () => {
      // 0-4L: 0
      // 4L-8L: 4,00,000 * 5% = 20,000
      // 8L-12L: 4,00,000 * 10% = 40,000
      // Total tax before rebate = 60,000.
      // Full rebate = 60,000.
      // Tax after rebate = 0.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1275000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(1200000);
      expect(res.taxLiability).toBe(0);
      expect(res.totalTax).toBe(0);
    });

    it('Boundary 4: Income immediately above threshold (₹12,00,010) gets marginal relief capped at ₹10', async () => {
      // Taxable income = 12,00,010.
      // Excess income over 12,00,000 = 10.
      // Slab tax: 60,000 + (10 * 15%) = 60,001.5 -> 60,002.
      // Marginal relief = 60,002 - 10 = 59,992.
      // Tax after rebate = 10.
      // Cess: 4% of 10 = 0.4 -> 0.
      // Net Tax = 10.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1275010 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(1200010);
      expect(res.taxLiability).toBe(10);
      expect(res.totalTax).toBe(10);
      expect(res.refundPayable).toBe(10);
    });

    it('Boundary 5: Mid-marginal relief zone at ₹12,50,000', async () => {
      // Taxable income = 12,50,000.
      // Excess income over 12,00,000 = 50,000.
      // Slab tax: 60,000 + (50,000 * 15%) = 67,500.
      // Tax (67,500) > Excess (50,000).
      // Marginal relief = 67,500 - 50,000 = 17,500.
      // Tax after rebate = 50,000.
      // Cess: 4% of 50,000 = 2,000.
      // Total Tax = 52,000.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1325000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(1250000);
      expect(res.taxLiability).toBe(50000);
      expect(res.cess).toBe(2000);
      expect(res.totalTax).toBe(52000);
      expect(res.refundPayable).toBe(52000);
    });

    it('Boundary 6: Above marginal relief cutoff at ₹13,00,000 (No rebate)', async () => {
      // Taxable income = 13,00,000.
      // Slab tax: 60,000 + 1,00,000 * 15% = 75,000.
      // Excess over 12L = 1,00,000.
      // Tax (75,000) < Excess (1,00,000) -> 0 marginal relief.
      // Cess: 4% of 75,000 = 3,000.
      // Total Tax = 78,000.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1375000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(1300000);
      expect(res.taxLiability).toBe(75000);
      expect(res.cess).toBe(3000);
      expect(res.totalTax).toBe(78000);
    });

    it('Boundary 7: Slab boundary at ₹16,00,000 (15% upper limit)', async () => {
      // 0-4L: 0
      // 4L-8L: 20,000
      // 8L-12L: 40,000
      // 12L-16L: 4,00,000 * 15% = 60,000
      // Total before cess: 1,20,000. Cess (4%): 4,800. Total Tax: 1,24,800.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1675000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(1600000);
      expect(res.taxLiability).toBe(120000);
      expect(res.cess).toBe(4800);
      expect(res.totalTax).toBe(124800);
    });

    it('Boundary 8: Slab boundary at ₹20,00,000 (20% upper limit)', async () => {
      // Up to 16L: 1,20,000
      // 16L-20L: 4,00,000 * 20% = 80,000
      // Total before cess: 2,00,000. Cess (4%): 8,000. Total Tax: 2,08,000.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 2075000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(2000000);
      expect(res.taxLiability).toBe(200000);
      expect(res.cess).toBe(8000);
      expect(res.totalTax).toBe(208000);
    });

    it('Boundary 9: Slab boundary at ₹24,00,000 (25% upper limit)', async () => {
      // Up to 20L: 2,00,000
      // 20L-24L: 4,00,000 * 25% = 1,00,000
      // Total before cess: 3,00,000. Cess (4%): 12,000. Total Tax: 3,12,000.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 2475000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(2400000);
      expect(res.taxLiability).toBe(300000);
      expect(res.cess).toBe(12000);
      expect(res.totalTax).toBe(312000);
    });

    it('Boundary 10: Top slab income (> ₹24,00,000 @ 30%)', async () => {
      // Taxable 30,00,000:
      // Up to 24L: 3,00,000
      // 24L-30L: 6,00,000 * 30% = 1,80,000
      // Total before cess: 4,80,000. Cess (4%): 19,200. Total Tax: 4,99,200.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 3075000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(3000000);
      expect(res.taxLiability).toBe(480000);
      expect(res.cess).toBe(19200);
      expect(res.totalTax).toBe(499200);
    });

    it('Boundary 11: Surcharge threshold at ₹50,00,010 with marginal relief', async () => {
      // Tax on 50,00,000:
      // Up to 24L: 3,00,000. 24L-50L (26L @ 30%): 7,80,000. Total: 10,80,000.
      // Surcharge on 50,00,010 without relief = 10% of 10,80,003 = 1,08,000.
      // Extra income = 10. Surcharge capped at extra income = 7.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 5075010 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.taxableIncome).toBe(5000010);
      expect(res.surcharge).toBeLessThan(100); // Surcharge is capped to ₹7
    });
  });

  // =========================================================================
  // SECTION 6: OLD REGIME UNDER TAX YEAR 2026-27
  // =========================================================================
  describe('Tax Year 2026-27 - Old Tax Regime', () => {
    it('applies Old Regime slabs, deductions and ₹5,00,000 rebate', async () => {
      // Gross 6,00,000.
      // Std Ded: 50,000. 80C: 1,00,000. 80D: 25,000.
      // Total Deductions: 1,75,000.
      // Taxable Income: 4,25,000.
      // Tax: 0-2.5L (0), 2.5L-4.25L (1.75L @ 5%) = 8,750.
      // Rebate (taxable <= 5L): 8,750.
      // Tax after rebate: 0. Total Tax: 0.
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 600000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 50000 },
        { section: '80C', claimedAmount: 100000 },
        { section: '80D', claimedAmount: 25000 },
      ]);

      const res = await calculateTax(returnId, userId, 'OLD');
      expect(res.ruleVersion).toBe('TY2026-27-v1');
      expect(res.taxableIncome).toBe(425000);
      expect(res.taxLiability).toBe(0);
      expect(res.totalTax).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 7: REFUND VS TAX PAYABLE
  // =========================================================================
  describe('Tax Payable vs Refund Calculation', () => {
    it('accurately calculates refund when TDS exceeds total tax liability', async () => {
      // Total Tax on 13,00,000 is 78,000.
      // TDS Deducted = 1,00,000.
      // Net Tax = 78,000 - 1,00,000 = -22,000.
      // Refund = 22,000 (Positive representation of refund).
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1375000, tds: 100000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.totalTax).toBe(78000);
      expect(res.tdsDeducted).toBe(100000);
      expect(res.refundPayable).toBe(-22000); // Stored signed in DB
    });

    it('accurately calculates tax payable when total tax exceeds TDS', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1375000, tds: 30000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 }
      ]);

      const res = await calculateTax(returnId, userId, 'NEW');
      expect(res.totalTax).toBe(78000);
      expect(res.tdsDeducted).toBe(30000);
      expect(res.refundPayable).toBe(48000);
    });
  });

  // =========================================================================
  // SECTION 8: LOCKED RETURN GUARDS
  // =========================================================================
  describe('Locked Return Protection', () => {
    it.each(['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'])('rejects calculateTax if tax return is in %s status', async (status) => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        status,
        regime: 'NEW',
        assessmentYear: 'TY 2026-27'
      });

      await expect(calculateTax(returnId, userId, 'NEW')).rejects.toThrow(`Cannot recalculate tax for a locked return (${status})`);
    });
  });

  // =========================================================================
  // SECTION 9: REGIME COMPARISON FULL SHAPE
  // =========================================================================
  describe('Regime Comparison Enriched Output', () => {
    it('returns complete regime results with grossIncome, standardDeduction, and slabBreakdown', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({
        id: returnId,
        status: 'DRAFT',
        regime: 'NEW',
        assessmentYear: 'TY 2026-27'
      });
      (consolidationService.consolidateIncome as any).mockResolvedValue([
        { incomeType: 'SALARY', amount: 1200000, tds: 50000 }
      ]);
      (prisma.deduction.findMany as any).mockResolvedValue([
        { section: '16(ia)', claimedAmount: 75000 },
        { section: '80C', claimedAmount: 150000 }
      ]);

      const comparison = await compareRegimes(returnId, userId);

      expect(comparison.assessmentYear).toBe('TY 2026-27');
      expect(comparison.ruleVersion).toBe('TY2026-27-v1');
      expect(comparison.new).toBeDefined();
      expect(comparison.old).toBeDefined();

      // Check that frontend-required properties are present and valid numbers
      expect(typeof comparison.new.grossIncome).toBe('number');
      expect(typeof comparison.new.standardDeduction).toBe('number');
      expect(typeof comparison.new.totalDeductions).toBe('number');
      expect(typeof comparison.new.taxableIncome).toBe('number');
      expect(typeof comparison.new.totalTax).toBe('number');
      expect(typeof comparison.new.tdsDeducted).toBe('number');
      expect(typeof comparison.new.taxPayable).toBe('number');
      expect(typeof comparison.new.refund).toBe('number');
      expect(Array.isArray(comparison.new.slabBreakdown)).toBe(true);

      expect(typeof comparison.old.grossIncome).toBe('number');
      expect(typeof comparison.old.standardDeduction).toBe('number');
      expect(typeof comparison.old.totalDeductions).toBe('number');
      expect(typeof comparison.old.taxableIncome).toBe('number');
      expect(typeof comparison.old.totalTax).toBe('number');
      expect(typeof comparison.old.tdsDeducted).toBe('number');
      expect(Array.isArray(comparison.old.slabBreakdown)).toBe(true);

      expect(['NEW', 'OLD']).toContain(comparison.recommendation);
      expect(typeof comparison.saving).toBe('number');
    });
  });

  // =========================================================================
  // SECTION 10: ADVANCED STATUTORY RULES & DEFECT REGRESSIONS
  // =========================================================================
  describe('Advanced Statutory Rules and Defect Regressions', () => {
    describe('Surcharge Marginal Relief Across Higher Tiers', () => {
      it('applies marginal relief at ₹1,00,00,010 (1 Cr tier, 15% vs 10% lower tier)', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 10075010 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.taxableIncome).toBe(10000010);
        // Slab tax on 1 Cr: 3L + (76L * 30%) = 25,80,000.
        // Tax with 10% surcharge on 1 Cr = 25,80,000 + 2,58,000 = 28,38,000.
        // Without relief, 15% surcharge would be 15% of 25,80,003 = 3,87,000 (+1,29,000 hike for 10 rupees).
        // With marginal relief, tax + surcharge <= 28,38,000 + 10 = 28,38,010.
        // So surcharge should be around 2,58,000 + ~7, not 3,87,000!
        expect(res.surcharge).toBeLessThan(260000);
        expect(res.surcharge).toBeGreaterThan(250000);
      });

      it('applies marginal relief at ₹2,00,00,010 (2 Cr tier, 25% vs 15% lower tier)', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'TY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 20075010 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.taxableIncome).toBe(20000010);
        // Slab tax on 2 Cr: 3L + (176L * 30%) = 55,80,000.
        // Tax with 15% surcharge on 2 Cr = 55,80,000 + 8,37,000 = 64,17,000.
        // Without relief, 25% surcharge would be ~13,95,000 (+5,58,000 hike for 10 rupees).
        // With marginal relief, tax + surcharge <= 64,17,000 + 10.
        // Surcharge should be around 8,37,000 + ~7, not 13,95,000!
        expect(res.surcharge).toBeLessThan(840000);
        expect(res.surcharge).toBeGreaterThan(830000);
      });
    });

    describe('Multiple Deductions per Section & Section 80CCE Aggregate Ceiling', () => {
      it('caps multiple deductions under Section 80C to cumulative ₹1,50,000', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'AY 2025-26' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1000000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 50000 },
          { section: '80C', claimedAmount: 100000 },
          { section: '80C', claimedAmount: 100000 }, // Total claimed 80C = 200,000
        ]);

        const res = await calculateTax(returnId, userId, 'OLD');
        // Total deductions must be 50,000 (std) + 1,50,000 (80C capped) = 2,00,000
        expect(res.totalDeductions).toBe(200000);
        expect(res.taxableIncome).toBe(800000);
      });

      it('enforces aggregate Section 80CCE cap of ₹1,50,000 across 80C and 80CCD(1)', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'AY 2025-26' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1000000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 50000 },
          { section: '80C', claimedAmount: 120000 },
          { section: '80CCD1', claimedAmount: 50000 }, // Sum = 1,70,000, capped at 1,50,000 by 80CCE
        ]);

        const res = await calculateTax(returnId, userId, 'OLD');
        // Std (50k) + 80CCE (150k) = 200,000
        expect(res.totalDeductions).toBe(200000);
        expect(res.taxableIncome).toBe(800000);
      });
    });

    describe('House Property Loss Set-off Rules (Section 115BAC vs Section 71(3A))', () => {
      it('prohibits house property loss set-off against salary under New Regime (Section 115BAC(2)(ii))', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'AY 2025-26' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1000000 },
          { incomeType: 'HOUSE_PROPERTY', amount: -150000 },
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        // Gross income must NOT be reduced by HP loss under New Regime
        expect(res.grossIncome).toBe(1000000);
        expect(res.taxableIncome).toBe(925000); // 10,00,000 - 75,000 std ded
      });

      it('caps house property loss set-off against salary at ₹2,00,000 under Old Regime (Section 71(3A))', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'AY 2025-26' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1000000 },
          { incomeType: 'HOUSE_PROPERTY', amount: -300000 }, // Loss exceeds 2L cap
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 50000 }
        ]);

        const res = await calculateTax(returnId, userId, 'OLD');
        // Set-off is capped at 2,00,000: 10,00,000 - 2,00,000 = 8,00,000 gross income
        expect(res.grossIncome).toBe(800000);
        expect(res.taxableIncome).toBe(750000); // 8,00,000 - 50,000 std ded
      });
    });

    describe('Old Regime Statutory Deduction Limits', () => {
      it('caps Section 24(b) interest deduction to ₹2,00,000 in Old Regime', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'AY 2025-26' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1000000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 50000 },
          { section: 'SEC_24B', claimedAmount: 250000 }
        ]);

        const res = await calculateTax(returnId, userId, 'OLD');
        expect(res.totalDeductions).toBe(250000); // 50,000 + 2,00,000
        expect(res.taxableIncome).toBe(750000);
      });

      it('allows Section 80E higher education loan interest deduction without statutory ceiling', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'AY 2025-26' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1000000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 50000 },
          { section: 'SEC_80E', claimedAmount: 180000 }
        ]);

        const res = await calculateTax(returnId, userId, 'OLD');
        expect(res.totalDeductions).toBe(230000); // 50,000 + 1,80,000
        expect(res.taxableIncome).toBe(770000);
      });
    });
  });

  // =========================================================================
  // SECTION 11: ASSESSMENT YEAR 2026-27 (INCOME-TAX ACT, 1961)
  // =========================================================================
  describe('Assessment Year 2026-27 (Income-tax Act, 1961) Verification', () => {
    describe('New Tax Regime Slabs & Section 87A Rebate with Marginal Relief', () => {
      it('calculates Nil tax up to basic exemption threshold of ₹4,00,000', async () => {
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'AY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 475000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.ruleVersion).toBe('AY2026-27-v1');
        expect(res.canonicalYear).toBe('AY 2026-27');
        expect(res.taxableIncome).toBe(400000);
        expect(res.taxLiability).toBe(0);
        expect(res.totalTax).toBe(0);
      });

      it('applies full Section 87A rebate at ₹12,00,000 threshold (₹12,75,000 gross with ₹75,000 std ded)', async () => {
        // Taxable 12,00,000:
        // 0-4L: 0
        // 4L-8L: 20,000
        // 8L-12L: 40,000
        // Total slab tax = 60,000. Rebate u/s 87A = 60,000 -> Tax after rebate = 0.
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'AY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1275000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.ruleVersion).toBe('AY2026-27-v1');
        expect(res.taxableIncome).toBe(1200000);
        expect(res.taxLiability).toBe(0);
        expect(res.totalTax).toBe(0);
      });

      it('applies Section 87A marginal relief immediately above threshold at ₹12,00,010', async () => {
        // Taxable 12,00,010. Excess over 12L = 10.
        // Slab tax = 60,001.5. Marginal relief caps tax liability to ₹10.
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'AY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1275010 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.ruleVersion).toBe('AY2026-27-v1');
        expect(res.taxableIncome).toBe(1200010);
        expect(res.taxLiability).toBe(10);
        expect(res.totalTax).toBe(10);
      });

      it('applies Section 87A marginal relief at ₹12,50,000 taxable income', async () => {
        // Taxable 12,50,000. Excess over 12L = 50,000.
        // Slab tax: 60,000 + 50,000 * 15% = 67,500.
        // Marginal relief = 67,500 - 50,000 = 17,500.
        // Tax after rebate = 50,000. Cess (4% of 50,000) = 2,000. Total Tax = 52,000.
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'AY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 1325000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.ruleVersion).toBe('AY2026-27-v1');
        expect(res.taxableIncome).toBe(1250000);
        expect(res.taxLiability).toBe(50000);
        expect(res.cess).toBe(2000);
        expect(res.totalTax).toBe(52000);
      });

      it('calculates higher slab tax accurately at ₹20,00,000 taxable income', async () => {
        // 0-4L: 0, 4L-8L: 20k, 8L-12L: 40k, 12L-16L: 60k, 16L-20L: 80k.
        // Total slab tax = 2,00,000. Cess = 8,000. Total Tax = 2,08,000.
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'NEW', assessmentYear: 'AY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 2075000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 75000 }
        ]);

        const res = await calculateTax(returnId, userId, 'NEW');
        expect(res.ruleVersion).toBe('AY2026-27-v1');
        expect(res.taxableIncome).toBe(2000000);
        expect(res.taxLiability).toBe(200000);
        expect(res.cess).toBe(8000);
        expect(res.totalTax).toBe(208000);
      });
    });

    describe('Old Tax Regime under AY 2026-27', () => {
      it('applies Old Regime slabs, ₹50,000 standard deduction, and ₹5,00,000 Section 87A rebate', async () => {
        // Gross 6,00,000. Std Ded 50,000, 80C 1,00,000, 80D 25,000.
        // Taxable 4,25,000. Slab tax = (4.25L - 2.5L) * 5% = 8,750. Full rebate u/s 87A. Total Tax = 0.
        (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, regime: 'OLD', assessmentYear: 'AY 2026-27' });
        (consolidationService.consolidateIncome as any).mockResolvedValue([
          { incomeType: 'SALARY', amount: 600000 }
        ]);
        (prisma.deduction.findMany as any).mockResolvedValue([
          { section: '16(ia)', claimedAmount: 50000 },
          { section: '80C', claimedAmount: 100000 },
          { section: '80D', claimedAmount: 25000 },
        ]);

        const res = await calculateTax(returnId, userId, 'OLD');
        expect(res.ruleVersion).toBe('AY2026-27-v1');
        expect(res.canonicalYear).toBe('AY 2026-27');
        expect(res.taxableIncome).toBe(425000);
        expect(res.taxLiability).toBe(0);
        expect(res.totalTax).toBe(0);
      });
    });

    describe('Framework Independence & Separation: AY 2026-27 vs TY 2026-27', () => {
      it('distinguishes AY 2026-27 (IT_ACT_1961) from TY 2026-27 (IT_ACT_2025)', async () => {
        const aySpec = resolveYearSpecification('AY 2026-27');
        expect(aySpec.framework).toBe('IT_ACT_1961');
        expect(aySpec.yearType).toBe('ASSESSMENT_YEAR');
        expect(aySpec.canonicalYear).toBe('AY 2026-27');
        expect(aySpec.ruleVersion).toBe('AY2026-27-v1');

        const tySpec = resolveYearSpecification('TY 2026-27');
        expect(tySpec.framework).toBe('IT_ACT_2025');
        expect(tySpec.yearType).toBe('TAX_YEAR');
        expect(tySpec.canonicalYear).toBe('TY 2026-27');
        expect(tySpec.ruleVersion).toBe('TY2026-27-v1');
      });

      it('disambiguates bare 2026-27 when framework metadata is explicitly provided', () => {
        const ayDisambiguated = resolveYearSpecification('2026-27', { framework: 'IT_ACT_1961' });
        expect(ayDisambiguated.canonicalYear).toBe('AY 2026-27');
        expect(ayDisambiguated.ruleVersion).toBe('AY2026-27-v1');

        const tyDisambiguated = resolveYearSpecification('2026-27', { framework: 'IT_ACT_2025' });
        expect(tyDisambiguated.canonicalYear).toBe('TY 2026-27');
        expect(tyDisambiguated.ruleVersion).toBe('TY2026-27-v1');
      });

      it('rejects bare 2026-27 without metadata as ambiguous', () => {
        expect(() => resolveYearSpecification('2026-27')).toThrow(
          "Ambiguous year identifier '2026-27'. Specify 'AY 2026-27' (Income-tax Act, 1961) or 'TY 2026-27' (Income-tax Act, 2025)."
        );
      });

      it('rejects conflicting metadata combinations across Acts', () => {
        expect(() => resolveYearSpecification('AY 2026-27', { framework: 'IT_ACT_2025' })).toThrow(
          "Inconsistent tax-year metadata: Specified framework 'IT_ACT_2025' does not match resolved framework 'IT_ACT_1961'"
        );
        expect(() => resolveYearSpecification('TY 2026-27', { framework: 'IT_ACT_1961' })).toThrow(
          "Inconsistent tax-year metadata: Specified framework 'IT_ACT_1961' does not match resolved framework 'IT_ACT_2025'"
        );
      });
    });
  });
});
