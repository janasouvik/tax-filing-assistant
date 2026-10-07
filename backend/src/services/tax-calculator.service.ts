/**
 * Tax Calculation Engine — AY 2026-27
 *
 * RULE ENGINE CALCULATES. AI EXPLAINS. LLM NEVER DETERMINES FINAL TAX.
 *
 * Implements both Old Regime and New Regime for AY 2026-27 (FY 2025-26).
 * All slabs and limits are sourced from official IT Department documentation.
 *
 * Sources:
 *   - Income Tax Act 1961 as amended by Finance Act 2025
 *   - https://www.incometax.gov.in/
 */

export interface TaxInput {
  assessmentYear: string;   // "2026-27"
  regime: 'OLD' | 'NEW';
  itrType: string;
  grossIncome: number;
  standardDeduction: number;
  deductions80C: number;
  deductions80D: number;
  deductions80CCD1B: number;
  deductions80CCD2: number;
  deductionsHousePropertyLoss: number;
  otherDeductions: number;
  tdsDeducted: number;
  advanceTaxPaid: number;
  residentialStatus?: 'RESIDENT' | 'NON_RESIDENT' | 'RESIDENT_BUT_NOT_ORDINARILY_RESIDENT';
  age?: number;
}

export interface TaxResult {
  regime: 'OLD' | 'NEW';
  assessmentYear: string;
  ruleVersion: string;
  grossIncome: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  tdsDeducted: number;
  advanceTaxPaid: number;
  taxPayable: number;
  refund: number;
  slabBreakdown: SlabBreakdown[];
}

export interface SlabBreakdown {
  from: number;
  to: number | null;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface RegimeComparison {
  assessmentYear: string;
  newRegime: TaxResult;
  oldRegime: TaxResult;
  recommendedRegime: 'OLD' | 'NEW';
  savings: number;
  savingsExplanation: string;
}

// ─────────────────────────────────────────────
//  New Regime Slabs — AY 2026-27 (Finance Act 2025)
//  Rebate u/s 87A: up to ₹7,00,000 taxable income
//  Standard Deduction: ₹75,000 for salaried
// ─────────────────────────────────────────────
const NEW_REGIME_SLABS_2026_27 = [
  { from: 0,         to: 400000,   rate: 0 },
  { from: 400000,    to: 800000,   rate: 5 },
  { from: 800000,    to: 1200000,  rate: 10 },
  { from: 1200000,   to: 1600000,  rate: 15 },
  { from: 1600000,   to: 2000000,  rate: 20 },
  { from: 2000000,   to: 2400000,  rate: 25 },
  { from: 2400000,   to: null,     rate: 30 },
];

// ─────────────────────────────────────────────
//  Old Regime Slabs — AY 2026-27
//  (Below 60 years; adjust for senior/super-senior citizens)
// ─────────────────────────────────────────────
const OLD_REGIME_SLABS_2026_27 = [
  { from: 0,       to: 250000,  rate: 0 },
  { from: 250000,  to: 500000,  rate: 5 },
  { from: 500000,  to: 1000000, rate: 20 },
  { from: 1000000, to: null,    rate: 30 },
];

const OLD_REGIME_SENIOR_SLABS_2026_27 = [
  { from: 0,       to: 300000,  rate: 0 },
  { from: 300000,  to: 500000,  rate: 5 },
  { from: 500000,  to: 1000000, rate: 20 },
  { from: 1000000, to: null,    rate: 30 },
];

const OLD_REGIME_SUPER_SENIOR_SLABS_2026_27 = [
  { from: 0,       to: 500000,  rate: 0 },
  { from: 500000,  to: 1000000, rate: 20 },
  { from: 1000000, to: null,    rate: 30 },
];

function applySlabs(taxableIncome: number, slabs: typeof NEW_REGIME_SLABS_2026_27): { total: number; breakdown: SlabBreakdown[] } {
  let total = 0;
  const breakdown: SlabBreakdown[] = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.from) break;
    const upper = slab.to !== null ? Math.min(taxableIncome, slab.to) : taxableIncome;
    const taxableAmount = upper - slab.from;
    const tax = (taxableAmount * slab.rate) / 100;
    total += tax;
    breakdown.push({ from: slab.from, to: slab.to, rate: slab.rate, taxableAmount, tax });
  }

  return { total, breakdown };
}

function computeSurcharge(tax: number, income: number): number {
  if (income <= 5000000) return 0;
  if (income <= 10000000) return tax * 0.10;
  if (income <= 20000000) return tax * 0.15;
  if (income <= 50000000) return tax * 0.25;
  return tax * 0.37;
}

function computeCess(tax: number): number {
  return tax * 0.04;
}

export function calculateTax(input: TaxInput): TaxResult {
  const { regime, grossIncome, tdsDeducted, advanceTaxPaid, age = 30, assessmentYear = '2026-27' } = input;

  // Deductions
  let totalDeductions = 0;
  let standardDeduction = 0;

  if (regime === 'NEW') {
    // New regime: standard deduction of ₹75,000 for salaried (FY 2025-26)
    standardDeduction = Math.min(input.standardDeduction || 75000, 75000);
    totalDeductions = standardDeduction;
    // 80CCD(2) employer NPS is allowed in new regime
    totalDeductions += Math.min(input.deductions80CCD2 || 0, grossIncome * 0.10);
  } else {
    // Old regime: all deductions allowed
    standardDeduction = Math.min(input.standardDeduction || 50000, 50000);
    totalDeductions = standardDeduction
      + Math.min(input.deductions80C || 0, 150000)
      + Math.min(input.deductions80D || 0, 25000)
      + Math.min(input.deductions80CCD1B || 0, 50000)
      + Math.min(input.deductions80CCD2 || 0, grossIncome * 0.10)
      + Math.min(Math.abs(input.deductionsHousePropertyLoss || 0), 200000)
      + (input.otherDeductions || 0);
  }

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Choose slabs
  let slabs = NEW_REGIME_SLABS_2026_27;
  if (regime === 'OLD') {
    if (age >= 80) slabs = OLD_REGIME_SUPER_SENIOR_SLABS_2026_27;
    else if (age >= 60) slabs = OLD_REGIME_SENIOR_SLABS_2026_27;
    else slabs = OLD_REGIME_SLABS_2026_27;
  }

  const { total: taxBeforeRebate, breakdown: slabBreakdown } = applySlabs(taxableIncome, slabs);

  // Rebate u/s 87A
  // New regime: full rebate if taxable income ≤ ₹7,00,000 (AY 2026-27)
  // Old regime: full rebate if taxable income ≤ ₹5,00,000
  let rebate87A = 0;
  if (regime === 'NEW' && taxableIncome <= 700000) {
    rebate87A = taxBeforeRebate;
  } else if (regime === 'OLD' && taxableIncome <= 500000) {
    rebate87A = Math.min(taxBeforeRebate, 12500);
  }

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A);
  const surcharge = computeSurcharge(taxAfterRebate, taxableIncome);
  const cess = computeCess(taxAfterRebate + surcharge);
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  const taxPayable = Math.max(0, totalTax - tdsDeducted - advanceTaxPaid);
  const refund = Math.max(0, tdsDeducted + advanceTaxPaid - totalTax);

  return {
    regime,
    assessmentYear,
    ruleVersion: 'AY2026-27-v1',
    grossIncome,
    standardDeduction,
    totalDeductions,
    taxableIncome,
    taxBeforeRebate: Math.round(taxBeforeRebate),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax,
    tdsDeducted,
    advanceTaxPaid,
    taxPayable: Math.round(taxPayable),
    refund: Math.round(refund),
    slabBreakdown,
  };
}

export function compareRegimes(input: Omit<TaxInput, 'regime'>): RegimeComparison {
  const newResult = calculateTax({ ...input, regime: 'NEW' });
  const oldResult = calculateTax({ ...input, regime: 'OLD' });

  const savings = oldResult.totalTax - newResult.totalTax;
  let recommendedRegime: 'OLD' | 'NEW';
  let savingsExplanation: string;

  if (savings > 0) {
    recommendedRegime = 'NEW';
    savingsExplanation = `New Regime saves you ₹${savings.toLocaleString('en-IN')} compared to Old Regime. Your deductions (₹${oldResult.totalDeductions.toLocaleString('en-IN')}) are not large enough to offset the lower slab rates of the New Regime.`;
  } else if (savings < 0) {
    recommendedRegime = 'OLD';
    savingsExplanation = `Old Regime saves you ₹${Math.abs(savings).toLocaleString('en-IN')} compared to New Regime. Your deductions (₹${oldResult.totalDeductions.toLocaleString('en-IN')}) are large enough to make Old Regime more beneficial.`;
  } else {
    recommendedRegime = 'NEW';
    savingsExplanation = 'Both regimes result in the same tax liability. New Regime recommended for simplicity.';
  }

  return {
    assessmentYear: input.assessmentYear || '2026-27',
    newRegime: newResult,
    oldRegime: oldResult,
    recommendedRegime,
    savings: Math.abs(savings),
    savingsExplanation,
  };
}
