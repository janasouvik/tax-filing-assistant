/**
 * Deterministic Tax Engine for TaxPilot
 * FY 2025-26 / AY 2026-27
 * LLM is NEVER authoritative for final tax numbers.
 */
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';
import { TaxRegime } from '@prisma/client';

const RULE_VERSION = '2025-26-v1';

// New Regime slabs FY 2025-26 (Finance Act 2024)
const NEW_REGIME_SLABS = [
  { upTo: 300000, rate: 0 },
  { upTo: 600000, rate: 0.05 },
  { upTo: 900000, rate: 0.1 },
  { upTo: 1200000, rate: 0.15 },
  { upTo: 1500000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

// Old Regime slabs
const OLD_REGIME_SLABS = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const OLD_REGIME_DEDUCTION_LIMITS: Record<string, number> = {
  SEC_80C: 150000,
  SEC_80CCD1B: 50000,
  SEC_80D: 25000,
  SEC_80TTA: 10000,
  STANDARD_DEDUCTION: 50000,
  HRA: Infinity,
  SEC_80CCD2: Infinity,
  SEC_80E: Infinity,
  SEC_80G: Infinity,
};

const NEW_REGIME_DEDUCTION_LIMITS: Record<string, number> = {
  SEC_80CCD2: Infinity,
  STANDARD_DEDUCTION: 75000,
};

const calculateSlabTax = (income: number, slabs: typeof NEW_REGIME_SLABS): number => {
  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (income <= prev) break;
    const taxable = Math.min(income, slab.upTo) - prev;
    tax += taxable * slab.rate;
    prev = slab.upTo;
    if (slab.upTo === Infinity) break;
  }
  return Math.round(tax);
};

const calculateSurcharge = (income: number, tax: number): number => {
  if (income > 50000000) return tax * 0.37;
  if (income > 20000000) return tax * 0.25;
  if (income > 10000000) return tax * 0.15;
  if (income > 5000000) return tax * 0.1;
  return 0;
};

export const calculateTax = async (returnId: string, userId: string, regime?: TaxRegime) => {
  const ret = await getTaxReturn(returnId, userId);
  const effectiveRegime: TaxRegime = regime || ret.regime;

  const [incomeEntries, deductions] = await Promise.all([
    prisma.incomeEntry.findMany({ where: { taxReturnId: returnId } }),
    prisma.deduction.findMany({ where: { taxReturnId: returnId } }),
  ]);

  const grossIncome = incomeEntries.reduce((s, i) => s + Number(i.amount), 0);
  const tdsDeducted = incomeEntries.reduce((s, i) => s + Number(i.tdsDeducted || 0), 0);

  const limits = effectiveRegime === 'NEW' ? NEW_REGIME_DEDUCTION_LIMITS : OLD_REGIME_DEDUCTION_LIMITS;

  let totalDeductions = 0;
  const lines: { code: string; description: string; amount: number; ruleCode?: string }[] = [];

  for (const ded of deductions) {
    const limit = limits[ded.section] ?? 0;
    const eligible = Math.min(Number(ded.claimedAmount), limit);
    if (eligible > 0) {
      totalDeductions += eligible;
      lines.push({ code: ded.section, description: ded.description, amount: -eligible, ruleCode: ded.section });
    }
  }

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Rebate u/s 87A
  const slabs = effectiveRegime === 'NEW' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  let taxLiability = calculateSlabTax(taxableIncome, slabs);

  if (effectiveRegime === 'NEW' && taxableIncome <= 700000) {
    taxLiability = 0; // Rebate u/s 87A
    lines.push({ code: 'REBATE_87A', description: 'Rebate u/s 87A', amount: 0, ruleCode: '87A' });
  } else if (effectiveRegime === 'OLD' && taxableIncome <= 500000) {
    taxLiability = 0;
    lines.push({ code: 'REBATE_87A', description: 'Rebate u/s 87A', amount: 0, ruleCode: '87A' });
  }

  const surcharge = Math.round(calculateSurcharge(taxableIncome, taxLiability));
  const cess = Math.round((taxLiability + surcharge) * 0.04);
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
      inputs: { incomeCount: incomeEntries.length, deductionCount: deductions.length },
      lines: {
        create: [
          { lineCode: 'GROSS_INCOME', description: 'Gross Total Income', amount: grossIncome, ruleCode: 'GTI', ruleVersion: RULE_VERSION, sortOrder: 1 },
          ...lines.map((l, i) => ({ lineCode: l.code, description: l.description, amount: l.amount, ruleCode: l.ruleCode, ruleVersion: RULE_VERSION, sortOrder: i + 2 })),
          { lineCode: 'TAXABLE_INCOME', description: 'Total Taxable Income', amount: taxableIncome, ruleCode: 'TI', ruleVersion: RULE_VERSION, sortOrder: 99 },
          { lineCode: 'TAX_LIABILITY', description: 'Income Tax', amount: taxLiability, ruleCode: 'SLAB', ruleVersion: RULE_VERSION, sortOrder: 100 },
          { lineCode: 'SURCHARGE', description: 'Surcharge', amount: surcharge, ruleCode: 'SURCHG', ruleVersion: RULE_VERSION, sortOrder: 101 },
          { lineCode: 'CESS', description: 'Health & Education Cess (4%)', amount: cess, ruleCode: 'CESS', ruleVersion: RULE_VERSION, sortOrder: 102 },
          { lineCode: 'TOTAL_TAX', description: 'Total Tax Payable', amount: totalTax, ruleCode: 'TOTAL', ruleVersion: RULE_VERSION, sortOrder: 103 },
          { lineCode: 'TDS', description: 'TDS Deducted', amount: -tdsDeducted, ruleCode: 'TDS', ruleVersion: RULE_VERSION, sortOrder: 104 },
          { lineCode: 'REFUND_PAYABLE', description: refundPayable >= 0 ? 'Refund Receivable' : 'Tax Payable', amount: refundPayable, ruleCode: 'FINAL', ruleVersion: RULE_VERSION, sortOrder: 105 },
        ],
      },
    },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
  });

  // Update readiness
  const readinessScore = Math.min(100, 40 + (incomeEntries.length > 0 ? 30 : 0) + (tdsDeducted > 0 ? 20 : 0) + (deductions.length > 0 ? 10 : 0));
  await prisma.taxReturn.update({ where: { id: returnId }, data: { readinessScore } });

  return calculation;
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
    old: { regime: 'OLD', totalTax: oldCalc.totalTax, taxableIncome: oldCalc.taxableIncome, refundPayable: oldCalc.refundPayable },
    new: { regime: 'NEW', totalTax: newCalc.totalTax, taxableIncome: newCalc.taxableIncome, refundPayable: newCalc.refundPayable },
    recommendation: Number(oldCalc.totalTax) > Number(newCalc.totalTax) ? 'NEW' : 'OLD',
    saving: Math.abs(Number(oldCalc.totalTax) - Number(newCalc.totalTax)),
  };
};
