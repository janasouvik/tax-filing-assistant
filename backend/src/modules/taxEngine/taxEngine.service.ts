/**
 * Deterministic Tax Engine for TaxPilot
 * Dynamically fetches rules from the TaxRule table.
 */
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';
import { TaxRegime } from '@prisma/client';

const RULE_VERSION = '2025-26-v1';

export const getRules = async (regime: TaxRegime, version: string = RULE_VERSION) => {
  const rules = await prisma.taxRule.findMany({
    where: {
      version,
      isActive: true,
      OR: [{ regime }, { regime: null }]
    }
  });

  const slabs = rules.find(r => r.code === (regime === 'NEW' ? 'SLABS_NEW' : 'SLABS_OLD'))?.parameters as any[];
  const rebate = rules.find(r => r.code === (regime === 'NEW' ? 'REBATE_87A_NEW' : 'REBATE_87A_OLD'))?.parameters as any;
  const dedLimits = rules.find(r => r.code === (regime === 'NEW' ? 'DED_LIMITS_NEW' : 'DED_LIMITS_OLD'))?.parameters as Record<string, number>;
  const surchargeRates = rules.find(r => r.code === 'SURCHARGE_RATES')?.parameters as any[];
  const cessRate = rules.find(r => r.code === 'CESS_RATE')?.parameters as any;

  if (!slabs || !rebate || !dedLimits || !surchargeRates || !cessRate) {
    throw new AppError('Tax rules not fully configured for this regime/version', 500);
  }

  return { slabs, rebate, dedLimits, surchargeRates, cessRate };
};

const calculateSlabTax = (income: number, slabs: any[]): { tax: number, breakdown: any[] } => {
  let tax = 0;
  let prev = 0;
  const breakdown: any[] = [];
  for (const slab of slabs) {
    if (income <= prev) break;
    const taxableAmount = Math.min(income, slab.upTo) - prev;
    const currentTax = taxableAmount * slab.rate;
    tax += currentTax;
    breakdown.push({
      from: prev,
      to: slab.upTo === 9999999999 ? null : slab.upTo,
      rate: slab.rate * 100,
      taxableAmount,
      tax: currentTax
    });
    prev = slab.upTo;
  }
  return { tax: Math.round(tax), breakdown };
};

const calculateSurcharge = (income: number, tax: number, surchargeRates: any[], regime: TaxRegime): number => {
  for (const tier of surchargeRates) {
    if (income > tier.incomeAbove) {
      let rate = tier.rate;
      // Cap surcharge at 25% for New Regime
      if (regime === 'NEW' && rate > 0.25) {
        rate = 0.25;
      }
      return tax * rate;
    }
  }
  return 0;
};

export const calculateTax = async (returnId: string, userId: string, regime?: TaxRegime) => {
  const ret = await getTaxReturn(returnId, userId);
  const effectiveRegime: TaxRegime = regime || ret.regime;

  const rules = await getRules(effectiveRegime);

  const [consolidatedIncome, deductions] = await Promise.all([
    import('../consolidation/consolidation.service').then(m => m.consolidateIncome(returnId, userId)),
    prisma.deduction.findMany({ where: { taxReturnId: returnId } }),
  ]);

  const grossIncome = consolidatedIncome.reduce((s, i) => s + Number(i.amount), 0);
  const tdsDeducted = consolidatedIncome.reduce((s, i) => s + Number(i.tds || 0), 0);

  let totalDeductions = 0;
  const lines: { code: string; description: string; amount: number; ruleCode?: string }[] = [];

  for (const ded of deductions) {
    const limit = rules.dedLimits[ded.section] ?? 0;
    const eligible = Math.min(Number(ded.claimedAmount), limit);
    if (eligible > 0) {
      totalDeductions += eligible;
      lines.push({ code: ded.section, description: ded.description, amount: -eligible, ruleCode: ded.section });
    }
  }

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  const slabCalc = calculateSlabTax(taxableIncome, rules.slabs);
  let taxLiability = slabCalc.tax;
  const slabBreakdown = slabCalc.breakdown;

  if (taxableIncome <= rules.rebate.maxIncome) {
    const rebateAmount = Math.min(taxLiability, rules.rebate.maxRebate);
    if (rebateAmount > 0) {
      taxLiability -= rebateAmount;
      lines.push({ code: 'REBATE_87A', description: 'Rebate u/s 87A', amount: -rebateAmount, ruleCode: '87A' });
    }
  }

  const surcharge = Math.round(calculateSurcharge(taxableIncome, taxLiability, rules.surchargeRates, effectiveRegime));
  const cess = Math.round((taxLiability + surcharge) * rules.cessRate.rate);
  const totalTax = taxLiability + surcharge + cess;
  const refundPayable = tdsDeducted - totalTax;

  const calculation = await prisma.taxCalculation.create({
    data: {
      taxReturnId: returnId,
      regime: effectiveRegime,
      ruleVersion: RULE_VERSION,
      grossIncome,
      totalDeductions,
      taxableIncome,
      taxLiability,
      surcharge,
      cess,
      totalTax,
      tdsDeducted,
      refundPayable,
      inputs: { incomeCount: consolidatedIncome.length, deductionCount: deductions.length },
      lines: {
        create: [
          { lineCode: 'GROSS_INCOME', description: 'Gross Total Income', amount: grossIncome, ruleCode: 'GTI', ruleVersion: RULE_VERSION, sortOrder: 1 },
          ...lines.map((l, i) => ({ lineCode: l.code, description: l.description, amount: l.amount, ruleCode: l.ruleCode, ruleVersion: RULE_VERSION, sortOrder: i + 2 })),
          { lineCode: 'TAXABLE_INCOME', description: 'Total Taxable Income', amount: taxableIncome, ruleCode: 'TI', ruleVersion: RULE_VERSION, sortOrder: 99 },
          { lineCode: 'TAX_LIABILITY', description: 'Income Tax', amount: taxLiability, ruleCode: 'SLAB', ruleVersion: RULE_VERSION, sortOrder: 100 },
          { lineCode: 'SURCHARGE', description: 'Surcharge', amount: surcharge, ruleCode: 'SURCHG', ruleVersion: RULE_VERSION, sortOrder: 101 },
          { lineCode: 'CESS', description: 'Health & Education Cess', amount: cess, ruleCode: 'CESS', ruleVersion: RULE_VERSION, sortOrder: 102 },
          { lineCode: 'TOTAL_TAX', description: 'Total Tax Payable', amount: totalTax, ruleCode: 'TOTAL', ruleVersion: RULE_VERSION, sortOrder: 103 },
          { lineCode: 'TDS', description: 'TDS Deducted', amount: -tdsDeducted, ruleCode: 'TDS', ruleVersion: RULE_VERSION, sortOrder: 104 },
          { lineCode: 'REFUND_PAYABLE', description: refundPayable >= 0 ? 'Refund Receivable' : 'Tax Payable', amount: refundPayable, ruleCode: 'FINAL', ruleVersion: RULE_VERSION, sortOrder: 105 },
        ],
      },
    },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
  });

  // Update readiness
  const readinessScore = Math.min(100, 40 + (consolidatedIncome.length > 0 ? 30 : 0) + (tdsDeducted > 0 ? 20 : 0) + (deductions.length > 0 ? 10 : 0));
  await prisma.taxReturn.update({ where: { id: returnId }, data: { readinessScore } });

  return { ...calculation, slabBreakdown };
};

export const getCalculation = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  return prisma.taxCalculation.findFirst({
    where: { taxReturnId: returnId },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { calculatedAt: 'desc' },
  });
};

export const compareRegimes = async (returnId: string, userId: string) => {
  const oldCalc = await calculateTax(returnId, userId, 'OLD');
  const newCalc = await calculateTax(returnId, userId, 'NEW');
  return {
    old: { regime: 'OLD', totalTax: oldCalc.totalTax, taxableIncome: oldCalc.taxableIncome, refundPayable: oldCalc.refundPayable, slabBreakdown: oldCalc.slabBreakdown },
    new: { regime: 'NEW', totalTax: newCalc.totalTax, taxableIncome: newCalc.taxableIncome, refundPayable: newCalc.refundPayable, slabBreakdown: newCalc.slabBreakdown },
    recommendation: Number(oldCalc.totalTax) > Number(newCalc.totalTax) ? 'NEW' : 'OLD',
    saving: Math.abs(Number(oldCalc.totalTax) - Number(newCalc.totalTax)),
  };
};
