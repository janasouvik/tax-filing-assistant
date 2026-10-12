/**
 * TaxEngine Service
 * Authoritative, deterministic calculation of Indian Income Tax.
 */
import { AppError } from '../utils/response';

export type TaxRegime = 'OLD' | 'NEW';

export interface TaxInput {
  assessmentYear: '2024-25' | '2025-26' | '2026-27';
  regime: TaxRegime;
  age?: number;
  
  // Income categories
  salaryIncome?: number;
  housePropertyIncome?: number;
  otherSourcesIncome?: number;
  
  // Deductions
  deduction80C?: number;
  deduction80D?: number;
  deduction80CCD1B?: number;
  deduction80CCD2?: number; // Employer NPS
  otherChapterVIADeductions?: number;
  
  // Taxes Paid
  tdsDeducted?: number;
  advanceTaxPaid?: number;
}

export interface SlabBreakdown {
  from: number;
  to: number | null;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface TaxResult {
  ruleVersion: string;
  regime: TaxRegime;
  grossIncome: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number; // Rounded u/s 288A
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  tdsDeducted: number;
  advanceTaxPaid: number;
  taxPayable: number; // Rounded u/s 288B
  refund: number;     // Rounded u/s 288B
  slabBreakdown: SlabBreakdown[];
  errors: string[];
}

/**
 * Section 288A: Round off income to nearest multiple of 10.
 */
function round288A(amount: number): number {
  const sign = Math.sign(amount);
  const absAmount = Math.abs(amount);
  return sign * (Math.round(Math.round(absAmount) / 10) * 10);
}

/**
 * Section 288B: Round off tax/refund to nearest multiple of 10.
 */
function round288B(amount: number): number {
  const sign = Math.sign(amount);
  const absAmount = Math.abs(amount);
  return sign * (Math.round(Math.round(absAmount) / 10) * 10);
}

function applySlabs(taxableIncome: number, slabs: {from: number, to: number | null, rate: number}[]): { tax: number, breakdown: SlabBreakdown[] } {
  let totalTax = 0;
  const breakdown: SlabBreakdown[] = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.from) break;
    const upper = slab.to !== null ? Math.min(taxableIncome, slab.to) : taxableIncome;
    const taxableAmount = upper - slab.from;
    const tax = (taxableAmount * slab.rate) / 100;
    totalTax += tax;
    breakdown.push({ from: slab.from, to: slab.to, rate: slab.rate, taxableAmount, tax });
  }

  return { tax: totalTax, breakdown };
}

// ---------------------------------------------------------
// RULES: AY 2024-25 (FY 2023-24)
// ---------------------------------------------------------
const SLABS_NEW_24_25 = [
  { from: 0,       to: 300000,  rate: 0 },
  { from: 300000,  to: 600000,  rate: 5 },
  { from: 600000,  to: 900000,  rate: 10 },
  { from: 900000,  to: 1200000, rate: 15 },
  { from: 1200000, to: 1500000, rate: 20 },
  { from: 1500000, to: null,    rate: 30 }
];

const SLABS_OLD_24_25_BELOW_60 = [
  { from: 0,       to: 250000,  rate: 0 },
  { from: 250000,  to: 500000,  rate: 5 },
  { from: 500000,  to: 1000000, rate: 20 },
  { from: 1000000, to: null,    rate: 30 }
];

const SLABS_OLD_24_25_SENIOR = [
  { from: 0,       to: 300000,  rate: 0 },
  { from: 300000,  to: 500000,  rate: 5 },
  { from: 500000,  to: 1000000, rate: 20 },
  { from: 1000000, to: null,    rate: 30 }
];

const SLABS_OLD_24_25_SUPER = [
  { from: 0,       to: 500000,  rate: 0 },
  { from: 500000,  to: 1000000, rate: 20 },
  { from: 1000000, to: null,    rate: 30 }
];

// ---------------------------------------------------------
// RULES: AY 2025-26 (FY 2024-25)
// ---------------------------------------------------------
const SLABS_NEW_25_26 = [
  { from: 0,       to: 300000,  rate: 0 },
  { from: 300000,  to: 700000,  rate: 5 },
  { from: 700000,  to: 1000000, rate: 10 },
  { from: 1000000, to: 1200000, rate: 15 },
  { from: 1200000, to: 1500000, rate: 20 },
  { from: 1500000, to: null,    rate: 30 }
];

// ---------------------------------------------------------
// RULES: Tax Year 2026-27 (Income-tax Act, 2025)
// ---------------------------------------------------------
const SLABS_NEW_26_27 = [
  { from: 0,       to: 400000,  rate: 0 },
  { from: 400000,  to: 800000,  rate: 5 },
  { from: 800000,  to: 1200000, rate: 10 },
  { from: 1200000, to: 1600000, rate: 15 },
  { from: 1600000, to: 2000000, rate: 20 },
  { from: 2000000, to: 2400000, rate: 25 },
  { from: 2400000, to: null,    rate: 30 }
];
// Old regime remains same as 24-25.

export function calculateTax(input: TaxInput): TaxResult {
  const errors: string[] = [];
  const age = input.age ?? 30;

  if (age < 0 || age > 120) {
    errors.push('Age must be between 0 and 120');
  }

  // Safely default incoming values
  const salary = Math.max(0, input.salaryIncome || 0);
  const houseProp = input.housePropertyIncome || 0; // Can be negative for loss
  const otherSrc = Math.max(0, input.otherSourcesIncome || 0);

  const grossIncome = Math.max(0, salary + houseProp + otherSrc);

  let standardDeduction = 0;
  let totalDeductions = 0;
  let ruleVersion = '';
  let slabs: any[] = [];
  
  let rebateThreshold = 0;
  let maxRebate = 0;

  if (input.assessmentYear === '2024-25') {
    ruleVersion = 'AY2024-25-v1';
    if (input.regime === 'NEW') {
      slabs = SLABS_NEW_24_25;
      standardDeduction = salary > 0 ? Math.min(salary, 50000) : 0;
      rebateThreshold = 700000;
      maxRebate = 25000;
      totalDeductions = standardDeduction + Math.min(input.deduction80CCD2 || 0, salary * 0.10);
    } else {
      slabs = age >= 80 ? SLABS_OLD_24_25_SUPER : age >= 60 ? SLABS_OLD_24_25_SENIOR : SLABS_OLD_24_25_BELOW_60;
      standardDeduction = salary > 0 ? Math.min(salary, 50000) : 0;
      rebateThreshold = 500000;
      maxRebate = 12500;
      totalDeductions = standardDeduction
        + Math.min(input.deduction80C || 0, 150000)
        + Math.min(input.deduction80D || 0, 100000) // Upper limit depends on age, simplistic max
        + Math.min(input.deduction80CCD1B || 0, 50000)
        + Math.min(input.deduction80CCD2 || 0, salary * 0.10)
        + (input.otherChapterVIADeductions || 0);
    }
  } else if (input.assessmentYear === '2025-26') {
    ruleVersion = 'AY2025-26-v1';
    if (input.regime === 'NEW') {
      slabs = SLABS_NEW_25_26;
      standardDeduction = salary > 0 ? Math.min(salary, 75000) : 0;
      rebateThreshold = 700000;
      maxRebate = 25000;
      totalDeductions = standardDeduction + Math.min(input.deduction80CCD2 || 0, salary * 0.10);
    } else {
      slabs = age >= 80 ? SLABS_OLD_24_25_SUPER : age >= 60 ? SLABS_OLD_24_25_SENIOR : SLABS_OLD_24_25_BELOW_60;
      standardDeduction = salary > 0 ? Math.min(salary, 50000) : 0;
      rebateThreshold = 500000;
      maxRebate = 12500;
      totalDeductions = standardDeduction
        + Math.min(input.deduction80C || 0, 150000)
        + Math.min(input.deduction80D || 0, 100000)
        + Math.min(input.deduction80CCD1B || 0, 50000)
        + Math.min(input.deduction80CCD2 || 0, salary * 0.10)
        + (input.otherChapterVIADeductions || 0);
    }
  } else if (input.assessmentYear === '2026-27') {
    ruleVersion = 'TY2026-27-v1';
    if (input.regime === 'NEW') {
      slabs = SLABS_NEW_26_27;
      standardDeduction = salary > 0 ? Math.min(salary, 75000) : 0;
      rebateThreshold = 1200000;
      maxRebate = 60000;
      totalDeductions = standardDeduction + Math.min(input.deduction80CCD2 || 0, salary * 0.10);
    } else {
      slabs = age >= 80 ? SLABS_OLD_24_25_SUPER : age >= 60 ? SLABS_OLD_24_25_SENIOR : SLABS_OLD_24_25_BELOW_60;
      standardDeduction = salary > 0 ? Math.min(salary, 50000) : 0;
      rebateThreshold = 500000;
      maxRebate = 12500;
      totalDeductions = standardDeduction
        + Math.min(input.deduction80C || 0, 150000)
        + Math.min(input.deduction80D || 0, 100000)
        + Math.min(input.deduction80CCD1B || 0, 50000)
        + Math.min(input.deduction80CCD2 || 0, salary * 0.10)
        + (input.otherChapterVIADeductions || 0);
    }
  } else {
    errors.push(`Unsupported Assessment Year / Tax Year: ${input.assessmentYear}`);
  }

  // Section 288A
  let taxableIncome = Math.max(0, grossIncome - totalDeductions);
  taxableIncome = round288A(taxableIncome);

  const { tax: taxBeforeRebate, breakdown } = applySlabs(taxableIncome, slabs);

  // Rebate u/s 87A including marginal relief
  let rebate87A = 0;
  if (taxableIncome <= rebateThreshold) {
    rebate87A = Math.min(taxBeforeRebate, maxRebate);
  } else if (input.regime === 'NEW') {
    // Marginal relief for New Regime:
    // If income exceeds 7L marginally, tax payable cannot exceed income over 7L.
    const excessIncome = taxableIncome - rebateThreshold;
    if (taxBeforeRebate > excessIncome) {
      rebate87A = taxBeforeRebate - excessIncome;
    }
  }

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A);

  // Surcharge (simplified brackets)
  let surchargeRate = 0;
  if (taxableIncome > 50000000) surchargeRate = input.regime === 'NEW' ? 0.25 : 0.37; // New regime capped at 25%
  else if (taxableIncome > 20000000) surchargeRate = 0.25;
  else if (taxableIncome > 10000000) surchargeRate = 0.15;
  else if (taxableIncome > 5000000) surchargeRate = 0.10;

  // Real surcharge needs marginal relief as well, but for simplicity we compute base here.
  let surcharge = taxAfterRebate * surchargeRate;
  
  // Basic surcharge marginal relief (Income slightly above threshold)
  if (taxableIncome > 5000000 && surcharge > 0) {
    const threshold = taxableIncome > 50000000 ? 50000000 : taxableIncome > 20000000 ? 20000000 : taxableIncome > 10000000 ? 10000000 : 5000000;
    const lowerSurchargeRate = threshold === 50000000 ? 0.25 : threshold === 20000000 ? 0.15 : threshold === 10000000 ? 0.10 : 0;
    const taxAtThreshold = applySlabs(threshold, slabs).tax;
    const taxAfterRebateThreshold = taxAtThreshold; // rebate is 0 at these levels
    const surchargeAtThreshold = taxAfterRebateThreshold * lowerSurchargeRate;
    
    const totalTaxAtThreshold = taxAfterRebateThreshold + surchargeAtThreshold;
    const currentTaxWithoutCess = taxAfterRebate + surcharge;
    
    const extraIncome = taxableIncome - threshold;
    const maxTax = totalTaxAtThreshold + extraIncome;
    
    if (currentTaxWithoutCess > maxTax) {
      surcharge = maxTax - taxAfterRebate;
    }
  }

  const cess = (taxAfterRebate + surcharge) * 0.04;
  const totalTax = taxAfterRebate + surcharge + cess;

  const tds = input.tdsDeducted || 0;
  const advance = input.advanceTaxPaid || 0;
  const netTax = totalTax - tds - advance;

  let taxPayable = 0;
  let refund = 0;
  
  if (netTax > 0) {
    taxPayable = round288B(netTax);
  } else if (netTax < 0) {
    refund = round288B(Math.abs(netTax));
  } else {
    taxPayable = round288B(netTax);
  }

  return {
    ruleVersion,
    regime: input.regime,
    grossIncome,
    standardDeduction,
    totalDeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    surcharge,
    cess,
    totalTax,
    tdsDeducted: tds,
    advanceTaxPaid: advance,
    taxPayable,
    refund,
    slabBreakdown: breakdown,
    errors
  };
}

export function compareRegimes(input: Omit<TaxInput, 'regime'>) {
  const newResult = calculateTax({ ...input, regime: 'NEW' });
  const oldResult = calculateTax({ ...input, regime: 'OLD' });

  const savings = oldResult.taxPayable - newResult.taxPayable + newResult.refund - oldResult.refund;
  
  let recommendedRegime: 'OLD' | 'NEW' = 'NEW';
  let savingsExplanation = '';

  if (savings > 0) {
    recommendedRegime = 'NEW';
    savingsExplanation = `New Regime saves you ₹${savings.toLocaleString('en-IN')}`;
  } else if (savings < 0) {
    recommendedRegime = 'OLD';
    savingsExplanation = `Old Regime saves you ₹${Math.abs(savings).toLocaleString('en-IN')}`;
  } else {
    recommendedRegime = 'NEW';
    savingsExplanation = 'Both regimes result in the same tax. New Regime is recommended for lower compliance burden.';
  }

  return {
    assessmentYear: input.assessmentYear,
    newRegime: newResult,
    oldRegime: oldResult,
    recommendedRegime,
    savings: Math.abs(savings),
    savingsExplanation
  };
}
