/**
 * Deterministic Tax Engine for TaxPilot
 * Dynamically fetches rules from the TaxRule table.
 */
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';
import { TaxRegime } from '@prisma/client';

export const round288 = (amount: number): number => {
  const sign = Math.sign(amount);
  const absAmount = Math.abs(amount);
  return sign * (Math.round(Math.round(absAmount) / 10) * 10);
};

export type TaxFramework = 'IT_ACT_1961' | 'IT_ACT_2025';
export type YearType = 'ASSESSMENT_YEAR' | 'TAX_YEAR';

export interface ResolvedYearInfo {
  framework: TaxFramework;
  yearType: YearType;
  canonicalYear: string;
  ruleVersion: string;
}

function validateMetadataConsistency(metadata: any, derived: ResolvedYearInfo, yearInput?: string): void {
  if (!metadata || typeof metadata !== 'object') return;

  const { framework, yearType, canonicalYear, ruleVersion } = metadata;

  // 1. Internal metadata contradictions
  if (framework === 'IT_ACT_1961' && yearType === 'TAX_YEAR') {
    throw new AppError(
      'Inconsistent tax-year metadata: framework IT_ACT_1961 cannot have yearType TAX_YEAR',
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (framework === 'IT_ACT_2025' && yearType === 'ASSESSMENT_YEAR') {
    throw new AppError(
      'Inconsistent tax-year metadata: framework IT_ACT_2025 cannot have yearType ASSESSMENT_YEAR',
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (framework === 'IT_ACT_1961' && typeof canonicalYear === 'string' && canonicalYear.startsWith('TY')) {
    throw new AppError(
      `Inconsistent tax-year metadata: framework IT_ACT_1961 cannot have canonicalYear '${canonicalYear}'`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (framework === 'IT_ACT_2025' && typeof canonicalYear === 'string' && canonicalYear.startsWith('AY')) {
    throw new AppError(
      `Inconsistent tax-year metadata: framework IT_ACT_2025 cannot have canonicalYear '${canonicalYear}'`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (framework === 'IT_ACT_1961' && typeof ruleVersion === 'string' && ruleVersion.startsWith('TY')) {
    throw new AppError(
      `Inconsistent tax-year metadata: framework IT_ACT_1961 cannot have ruleVersion '${ruleVersion}'`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (framework === 'IT_ACT_2025' && typeof ruleVersion === 'string' && ruleVersion.startsWith('AY')) {
    throw new AppError(
      `Inconsistent tax-year metadata: framework IT_ACT_2025 cannot have ruleVersion '${ruleVersion}'`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }

  // 2. Contradiction between specified metadata and authoritative derived year specification
  if (framework && framework !== derived.framework) {
    throw new AppError(
      `Inconsistent tax-year metadata: Specified framework '${framework}' does not match resolved framework '${derived.framework}' for ${yearInput || derived.canonicalYear}`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (yearType && yearType !== derived.yearType) {
    throw new AppError(
      `Inconsistent tax-year metadata: Specified yearType '${yearType}' does not match resolved yearType '${derived.yearType}' for ${yearInput || derived.canonicalYear}`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (canonicalYear && canonicalYear !== derived.canonicalYear) {
    throw new AppError(
      `Inconsistent tax-year metadata: Specified canonicalYear '${canonicalYear}' does not match resolved canonicalYear '${derived.canonicalYear}'`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
  if (ruleVersion && ruleVersion !== derived.ruleVersion) {
    throw new AppError(
      `Inconsistent tax-year metadata: Specified ruleVersion '${ruleVersion}' does not match resolved ruleVersion '${derived.ruleVersion}'`,
      400,
      'INCONSISTENT_TAX_YEAR_METADATA'
    );
  }
}

export function resolveYearSpecification(yearInput?: string, metadata?: any): ResolvedYearInfo {
  const metaFramework: TaxFramework | undefined = metadata?.framework;
  const metaYearType: YearType | undefined = metadata?.yearType;

  const raw = (yearInput || '').trim();
  if (!raw) {
    if (metaFramework === 'IT_ACT_2025' || metaYearType === 'TAX_YEAR') {
      const result: ResolvedYearInfo = {
        framework: 'IT_ACT_2025',
        yearType: 'TAX_YEAR',
        canonicalYear: 'TY 2026-27',
        ruleVersion: 'TY2026-27-v1',
      };
      validateMetadataConsistency(metadata, result, yearInput);
      return result;
    }
    throw new AppError('Assessment Year or Tax Year must be specified on the tax return.', 400, 'MISSING_TAX_YEAR');
  }

  const normalized = raw.toUpperCase().replace(/\s+/g, ' ');

  // Explicit Tax Year 2026-27 (Income-tax Act, 2025)
  if (
    normalized === 'TY 2026-27' ||
    normalized === 'TY2026-27' ||
    normalized === 'TAX YEAR 2026-27' ||
    normalized === 'TY 2026-2027' ||
    normalized === 'TY2026-2027'
  ) {
    const result: ResolvedYearInfo = {
      framework: 'IT_ACT_2025',
      yearType: 'TAX_YEAR',
      canonicalYear: 'TY 2026-27',
      ruleVersion: 'TY2026-27-v1',
    };
    validateMetadataConsistency(metadata, result, yearInput);
    return result;
  }

  // Explicit Assessment Year 2026-27 (Income-tax Act, 1961)
  if (
    normalized === 'AY 2026-27' ||
    normalized === 'AY2026-27' ||
    normalized === 'ASSESSMENT YEAR 2026-27'
  ) {
    const result: ResolvedYearInfo = {
      framework: 'IT_ACT_1961',
      yearType: 'ASSESSMENT_YEAR',
      canonicalYear: 'AY 2026-27',
      ruleVersion: 'AY2026-27-v1',
    };
    validateMetadataConsistency(metadata, result, yearInput);
    return result;
  }

  // Bare 2026-27: Ambiguous unless disambiguated by metadata
  if (normalized === '2026-27' || normalized === '2026-2027') {
    if (metaFramework === 'IT_ACT_2025' || metaYearType === 'TAX_YEAR') {
      const result: ResolvedYearInfo = {
        framework: 'IT_ACT_2025',
        yearType: 'TAX_YEAR',
        canonicalYear: 'TY 2026-27',
        ruleVersion: 'TY2026-27-v1',
      };
      validateMetadataConsistency(metadata, result, yearInput);
      return result;
    }
    if (metaFramework === 'IT_ACT_1961' || metaYearType === 'ASSESSMENT_YEAR') {
      const result: ResolvedYearInfo = {
        framework: 'IT_ACT_1961',
        yearType: 'ASSESSMENT_YEAR',
        canonicalYear: 'AY 2026-27',
        ruleVersion: 'AY2026-27-v1',
      };
      validateMetadataConsistency(metadata, result, yearInput);
      return result;
    }
    throw new AppError(
      "Ambiguous year identifier '2026-27'. Specify 'AY 2026-27' (Income-tax Act, 1961) or 'TY 2026-27' (Income-tax Act, 2025).",
      400,
      'AMBIGUOUS_YEAR_IDENTIFIER'
    );
  }

  // Reject invalid TY usage for historical years
  if (
    normalized.startsWith('TY') &&
    (normalized.includes('2024-25') || normalized.includes('2025-26'))
  ) {
    throw new AppError(
      "The Tax Year (TY) framework under Income-tax Act, 2025 is not applicable prior to 2026-27. Use 'AY 2024-25' or 'AY 2025-26'.",
      400,
      'INVALID_YEAR_FRAMEWORK'
    );
  }

  // AY 2024-25 (Income-tax Act, 1961)
  if (
    normalized === '2024-25' ||
    normalized === 'AY 2024-25' ||
    normalized === 'AY2024-25' ||
    normalized === 'ASSESSMENT YEAR 2024-25'
  ) {
    const result: ResolvedYearInfo = {
      framework: 'IT_ACT_1961',
      yearType: 'ASSESSMENT_YEAR',
      canonicalYear: 'AY 2024-25',
      ruleVersion: 'AY2024-25-v1',
    };
    validateMetadataConsistency(metadata, result, yearInput);
    return result;
  }

  // AY 2025-26 (Income-tax Act, 1961)
  if (
    normalized === '2025-26' ||
    normalized === 'AY 2025-26' ||
    normalized === 'AY2025-26' ||
    normalized === 'ASSESSMENT YEAR 2025-26'
  ) {
    const result: ResolvedYearInfo = {
      framework: 'IT_ACT_1961',
      yearType: 'ASSESSMENT_YEAR',
      canonicalYear: 'AY 2025-26',
      ruleVersion: 'AY2025-26-v1',
    };
    validateMetadataConsistency(metadata, result, yearInput);
    return result;
  }

  throw new AppError(`Unsupported tax year or assessment year: ${yearInput}`, 400, 'UNSUPPORTED_YEAR');
}

export function resolveRuleVersion(yearInput: string, metadata?: any): string {
  return resolveYearSpecification(yearInput, metadata).ruleVersion;
}

export interface StaticTaxRules {
  slabs: { upTo: number; rate: number }[];
  rebate: { maxIncome: number; maxRebate: number };
  dedLimits: Record<string, number>;
  surchargeRates: { incomeAbove: number; rate: number }[];
  cessRate: { rate: number };
}

export const STATUTORY_RULES: Record<string, Record<TaxRegime, StaticTaxRules>> = {
  'AY2024-25-v1': {
    NEW: {
      slabs: [
        { upTo: 300000, rate: 0 },
        { upTo: 600000, rate: 0.05 },
        { upTo: 900000, rate: 0.10 },
        { upTo: 1200000, rate: 0.15 },
        { upTo: 1500000, rate: 0.20 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 700000, maxRebate: 25000 },
      dedLimits: {
        '16(ia)': 50000,
        STANDARD_DEDUCTION: 50000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.25 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
    OLD: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 500000, maxRebate: 12500 },
      dedLimits: {
        '16(ia)': 50000,
        STANDARD_DEDUCTION: 50000,
        '80C': 150000,
        SEC_80C: 150000,
        '80CCD(1)': 150000,
        '80CCD1': 150000,
        SEC_80CCD1: 150000,
        '80CCD(1B)': 50000,
        SEC_80CCD1B: 50000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
        '80D': 25000,
        SEC_80D: 25000,
        '80E': 9999999999,
        SEC_80E: 9999999999,
        '80G': 9999999999,
        SEC_80G: 9999999999,
        '80TTA': 10000,
        SEC_80TTA: 10000,
        '80TTB': 50000,
        SEC_80TTB: 50000,
        '24(b)': 200000,
        SEC_24B: 200000,
        HRA: 9999999999,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.37 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
  },
  'AY2025-26-v1': {
    NEW: {
      slabs: [
        { upTo: 300000, rate: 0 },
        { upTo: 700000, rate: 0.05 },
        { upTo: 1000000, rate: 0.10 },
        { upTo: 1200000, rate: 0.15 },
        { upTo: 1500000, rate: 0.20 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 700000, maxRebate: 25000 },
      dedLimits: {
        '16(ia)': 75000,
        STANDARD_DEDUCTION: 75000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.25 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
    OLD: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 500000, maxRebate: 12500 },
      dedLimits: {
        '16(ia)': 50000,
        STANDARD_DEDUCTION: 50000,
        '80C': 150000,
        SEC_80C: 150000,
        '80CCD(1)': 150000,
        '80CCD1': 150000,
        SEC_80CCD1: 150000,
        '80CCD(1B)': 50000,
        SEC_80CCD1B: 50000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
        '80D': 25000,
        SEC_80D: 25000,
        '80E': 9999999999,
        SEC_80E: 9999999999,
        '80G': 9999999999,
        SEC_80G: 9999999999,
        '80TTA': 10000,
        SEC_80TTA: 10000,
        '80TTB': 50000,
        SEC_80TTB: 50000,
        '24(b)': 200000,
        SEC_24B: 200000,
        HRA: 9999999999,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.37 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
  },
  'AY2026-27-v1': {
    NEW: {
      slabs: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.10 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.20 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 1200000, maxRebate: 60000 },
      dedLimits: {
        '16(ia)': 75000,
        STANDARD_DEDUCTION: 75000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.25 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
    OLD: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 500000, maxRebate: 12500 },
      dedLimits: {
        '16(ia)': 50000,
        STANDARD_DEDUCTION: 50000,
        '80C': 150000,
        SEC_80C: 150000,
        '80CCD(1)': 150000,
        '80CCD1': 150000,
        SEC_80CCD1: 150000,
        '80CCD(1B)': 50000,
        SEC_80CCD1B: 50000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
        '80D': 25000,
        SEC_80D: 25000,
        '80E': 9999999999,
        SEC_80E: 9999999999,
        '80G': 9999999999,
        SEC_80G: 9999999999,
        '80TTA': 10000,
        SEC_80TTA: 10000,
        '80TTB': 50000,
        SEC_80TTB: 50000,
        '24(b)': 200000,
        SEC_24B: 200000,
        HRA: 9999999999,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.37 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
  },
  'TY2026-27-v1': {
    NEW: {
      slabs: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.10 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.20 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 1200000, maxRebate: 60000 },
      dedLimits: {
        '16(ia)': 75000,
        STANDARD_DEDUCTION: 75000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.25 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
    OLD: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: 9999999999, rate: 0.30 },
      ],
      rebate: { maxIncome: 500000, maxRebate: 12500 },
      dedLimits: {
        '16(ia)': 50000,
        STANDARD_DEDUCTION: 50000,
        '80C': 150000,
        SEC_80C: 150000,
        '80CCD(1)': 150000,
        '80CCD1': 150000,
        SEC_80CCD1: 150000,
        '80CCD(1B)': 50000,
        SEC_80CCD1B: 50000,
        '80CCD(2)': 750000,
        SEC_80CCD2: 750000,
        '80D': 25000,
        SEC_80D: 25000,
        '80E': 9999999999,
        SEC_80E: 9999999999,
        '80G': 9999999999,
        SEC_80G: 9999999999,
        '80TTA': 10000,
        SEC_80TTA: 10000,
        '80TTB': 50000,
        SEC_80TTB: 50000,
        '24(b)': 200000,
        SEC_24B: 200000,
        HRA: 9999999999,
      },
      surchargeRates: [
        { incomeAbove: 50000000, rate: 0.37 },
        { incomeAbove: 20000000, rate: 0.25 },
        { incomeAbove: 10000000, rate: 0.15 },
        { incomeAbove: 5000000, rate: 0.10 },
      ],
      cessRate: { rate: 0.04 },
    },
  },
};

export const getRules = async (regime: TaxRegime, assessmentYear: string, metadata?: any) => {
  const version = resolveRuleVersion(assessmentYear, metadata);

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

  if (slabs && rebate && dedLimits && surchargeRates && cessRate) {
    return { slabs, rebate, dedLimits, surchargeRates, cessRate, ruleVersion: version };
  }

  // Fallback to statutory rules definition if database has not seeded this version
  const fallback = STATUTORY_RULES[version]?.[regime];
  if (fallback) {
    return {
      slabs: slabs || fallback.slabs,
      rebate: rebate || fallback.rebate,
      dedLimits: dedLimits || fallback.dedLimits,
      surchargeRates: surchargeRates || fallback.surchargeRates,
      cessRate: cessRate || fallback.cessRate,
      ruleVersion: version,
    };
  }

  throw new AppError(`Tax rules not fully configured for regime ${regime} and version ${version}`, 500);
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
  if (ret.status && ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(ret.status)) {
    throw new AppError(`Cannot recalculate tax for a locked return (${ret.status})`, 403, 'LOCKED_RETURN');
  }
  const effectiveRegime: TaxRegime = regime || ret.regime;

  const yearInput = (ret.metadata as any)?.canonicalYear || ret.assessmentYear || (ret.metadata as any)?.taxYear || ret.financialYear;
  if (!yearInput) {
    throw new AppError('Assessment Year or Tax Year must be specified on the tax return.', 400, 'MISSING_TAX_YEAR');
  }

  const yearInfo = resolveYearSpecification(yearInput, ret.metadata);
  const rules = await getRules(effectiveRegime, yearInfo.canonicalYear, ret.metadata);
  const RULE_VERSION = rules.ruleVersion;

  const [consolidatedIncome, deductions] = await Promise.all([
    import('../consolidation/consolidation.service').then(m => m.consolidateIncome(returnId, userId)),
    prisma.deduction.findMany({ where: { taxReturnId: returnId } }),
  ]);

  // Validate supported income types
  const supportedTypes = ['SALARY', 'HOUSE_PROPERTY', 'OTHER_SOURCES', 'OTHER'];
  for (const inc of consolidatedIncome) {
    const incType = inc.incomeType || inc.type;
    if (!supportedTypes.includes(incType)) {
      throw new AppError(`Unsupported income category for deterministic calculation: ${incType}`, 400, 'UNSUPPORTED_INCOME');
    }
    if (Number(inc.amount) < 0 && incType !== 'HOUSE_PROPERTY') {
      throw new AppError(`Negative income is not allowed for ${incType}`, 400, 'INVALID_INPUT');
    }
  }

  // Statutory Head-wise Aggregation and House Property Loss Set-Off Rules
  const housePropertyIncome = consolidatedIncome
    .filter(i => (i.incomeType || i.type) === 'HOUSE_PROPERTY')
    .reduce((s, i) => s + Number(i.amount), 0);

  const otherHeadsIncome = consolidatedIncome
    .filter(i => (i.incomeType || i.type) !== 'HOUSE_PROPERTY')
    .reduce((s, i) => s + Number(i.amount), 0);

  let grossIncome = 0;
  if (housePropertyIncome >= 0) {
    grossIncome = otherHeadsIncome + housePropertyIncome;
  } else {
    // Net result from House Property is a loss
    if (effectiveRegime === 'NEW') {
      // Under Section 115BAC(2)(ii), set-off of house property loss against any other head is strictly disallowed
      grossIncome = Math.max(0, otherHeadsIncome);
    } else {
      // Under Old Regime (Section 71(3A)), set-off of house property loss against other heads is capped at ₹2,00,000
      const allowableLossSetoff = Math.min(Math.abs(housePropertyIncome), 200000);
      grossIncome = Math.max(0, otherHeadsIncome - allowableLossSetoff);
    }
  }

  const tdsDeducted = consolidatedIncome.reduce((s, i) => s + Number(i.tds || 0), 0);

  let totalDeductions = 0;
  const lines: { code: string; description: string; amount: number; ruleCode?: string }[] = [];

  // Enforce section-wise limits and Section 80CCE cumulative ceiling
  const remainingLimits: Record<string, number> = { ...rules.dedLimits };
  let remaining80CCE = rules.dedLimits['SEC_80C'] ?? rules.dedLimits['80C'] ?? 150000;

  for (const ded of deductions) {
    const claimed = Number(ded.claimedAmount);
    if (claimed < 0) {
      throw new AppError(`Negative deduction amount is not allowed for ${ded.section}`, 400, 'INVALID_INPUT');
    }
    const sec = ded.section;
    const normalizedSec = sec.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let limit = remainingLimits[sec] ?? remainingLimits[`SEC_${sec}`] ?? remainingLimits[sec.replace('SEC_', '')] ?? 0;

    // Check shared 80CCE cap for 80C and 80CCD(1)
    const is80CCE = normalizedSec === '80C' || normalizedSec === 'SEC80C' || normalizedSec === '80CCD1' || normalizedSec === 'SEC80CCD1';
    if (is80CCE) {
      limit = Math.min(limit, remaining80CCE);
    }

    const eligible = Math.min(claimed, limit);
    if (eligible > 0) {
      totalDeductions += eligible;
      remainingLimits[sec] = Math.max(0, (remainingLimits[sec] ?? eligible) - eligible);
      const altSec = sec.startsWith('SEC_') ? sec.replace('SEC_', '') : `SEC_${sec}`;
      if (remainingLimits[altSec] !== undefined) {
        remainingLimits[altSec] = Math.max(0, remainingLimits[altSec] - eligible);
      }
      if (normalizedSec === '80CCD1' || normalizedSec === 'SEC80CCD1') {
        if (remainingLimits['80CCD(1)'] !== undefined) remainingLimits['80CCD(1)'] = Math.max(0, remainingLimits['80CCD(1)'] - eligible);
        if (remainingLimits['80CCD1'] !== undefined) remainingLimits['80CCD1'] = Math.max(0, remainingLimits['80CCD1'] - eligible);
        if (remainingLimits['SEC_80CCD1'] !== undefined) remainingLimits['SEC_80CCD1'] = Math.max(0, remainingLimits['SEC_80CCD1'] - eligible);
      }
      if (is80CCE) {
        remaining80CCE = Math.max(0, remaining80CCE - eligible);
      }
      lines.push({ code: ded.section, description: ded.description, amount: -eligible, ruleCode: ded.section });
    }
  }

  // Section 288A: Total Income rounded to nearest 10
  let taxableIncome = Math.max(0, grossIncome - totalDeductions);
  taxableIncome = round288(taxableIncome);

  const slabCalc = calculateSlabTax(taxableIncome, rules.slabs);
  let taxLiability = slabCalc.tax;
  const slabBreakdown = slabCalc.breakdown;

  // Section 87A Rebate with Marginal Relief
  if (taxableIncome <= rules.rebate.maxIncome) {
    const rebateAmount = Math.min(taxLiability, rules.rebate.maxRebate);
    if (rebateAmount > 0) {
      taxLiability -= rebateAmount;
      lines.push({ code: 'REBATE_87A', description: 'Rebate u/s 87A', amount: -rebateAmount, ruleCode: '87A' });
    }
  } else if (effectiveRegime === 'NEW') {
    // Marginal Relief for New Regime under Section 87A proviso
    const excessIncome = taxableIncome - rules.rebate.maxIncome;
    if (taxLiability > excessIncome) {
      const rebateAmount = taxLiability - excessIncome;
      taxLiability -= rebateAmount;
      lines.push({ code: 'REBATE_87A_MARGINAL', description: 'Marginal Relief u/s 87A', amount: -rebateAmount, ruleCode: '87A_MARGINAL' });
    }
  }

  // Surcharge computation with robust descending sort
  const sortedSurchargeRates = [...rules.surchargeRates].sort((a, b) => b.incomeAbove - a.incomeAbove);
  let surcharge = calculateSurcharge(taxableIncome, taxLiability, sortedSurchargeRates, effectiveRegime);
  
  // Surcharge marginal relief across all tiers
  if (surcharge > 0) {
    const applicableTier = sortedSurchargeRates.find(t => taxableIncome > t.incomeAbove);
    if (applicableTier) {
      const threshold = applicableTier.incomeAbove;
      const lowerTier = sortedSurchargeRates.find(t => t.incomeAbove < threshold);
      let lowerRate = lowerTier ? lowerTier.rate : 0;
      if (effectiveRegime === 'NEW' && lowerRate > 0.25) lowerRate = 0.25;

      const taxAtThreshold = calculateSlabTax(threshold, rules.slabs).tax;
      const surchargeAtThreshold = taxAtThreshold * lowerRate;
      const totalTaxAtThreshold = taxAtThreshold + surchargeAtThreshold;
      const extraIncome = taxableIncome - threshold;
      const maxTax = totalTaxAtThreshold + extraIncome;

      const currentTax = taxLiability + surcharge;
      if (currentTax > maxTax) {
        surcharge = Math.max(surchargeAtThreshold, maxTax - taxLiability);
      }
    }
  }
  surcharge = Math.round(surcharge);

  const cess = Math.round((taxLiability + surcharge) * rules.cessRate.rate);
  const totalTax = taxLiability + surcharge + cess;
  const netTax = totalTax - tdsDeducted;

  // Section 288B: Tax payable/refundable rounded to nearest 10
  const refundPayable = round288(netTax);
  
  // Delete old calculations to maintain 1-to-1 or clean history
  await prisma.taxCalculation.deleteMany({ where: { taxReturnId: returnId, regime: effectiveRegime } });

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
          { lineCode: 'TAXABLE_INCOME', description: 'Total Taxable Income (Rounded u/s 288A)', amount: taxableIncome, ruleCode: '288A', ruleVersion: RULE_VERSION, sortOrder: 99 },
          { lineCode: 'TAX_LIABILITY', description: 'Income Tax', amount: taxLiability, ruleCode: 'SLAB', ruleVersion: RULE_VERSION, sortOrder: 100 },
          { lineCode: 'SURCHARGE', description: 'Surcharge', amount: surcharge, ruleCode: 'SURCHG', ruleVersion: RULE_VERSION, sortOrder: 101 },
          { lineCode: 'CESS', description: 'Health & Education Cess', amount: cess, ruleCode: 'CESS', ruleVersion: RULE_VERSION, sortOrder: 102 },
          { lineCode: 'TOTAL_TAX', description: 'Total Tax Payable', amount: totalTax, ruleCode: 'TOTAL', ruleVersion: RULE_VERSION, sortOrder: 103 },
          { lineCode: 'TDS', description: 'TDS Deducted', amount: -tdsDeducted, ruleCode: 'TDS', ruleVersion: RULE_VERSION, sortOrder: 104 },
          { lineCode: 'REFUND_PAYABLE', description: refundPayable >= 0 ? 'Tax Payable (Rounded u/s 288B)' : 'Refund Receivable (Rounded u/s 288B)', amount: Math.abs(refundPayable), ruleCode: '288B', ruleVersion: RULE_VERSION, sortOrder: 105 },
        ],
      },
    },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
  });

  // Update readiness and persist canonical year metadata
  const readinessScore = Math.min(100, 40 + (consolidatedIncome.length > 0 ? 30 : 0) + (tdsDeducted > 0 ? 20 : 0) + (deductions.length > 0 ? 10 : 0));
  const existingMetadata = typeof ret.metadata === 'object' && ret.metadata !== null ? (ret.metadata as object) : {};
  const updatedMetadata = {
    ...existingMetadata,
    framework: yearInfo.framework,
    yearType: yearInfo.yearType,
    canonicalYear: yearInfo.canonicalYear,
    ruleVersion: yearInfo.ruleVersion,
  };
  await prisma.taxReturn.update({
    where: { id: returnId },
    data: {
      readinessScore,
      assessmentYear: yearInfo.canonicalYear,
      metadata: updatedMetadata,
    },
  });

  return { ...calculation, slabBreakdown, ruleVersion: RULE_VERSION, canonicalYear: yearInfo.canonicalYear };
};

export const getCalculation = async (returnId: string, userId: string) => {
  const ret = await getTaxReturn(returnId, userId);
  const calc = await prisma.taxCalculation.findFirst({
    where: { taxReturnId: returnId, regime: ret.regime },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { calculatedAt: 'desc' },
  });
  if (calc) return calc;
  return prisma.taxCalculation.findFirst({
    where: { taxReturnId: returnId },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { calculatedAt: 'desc' },
  });
};

function formatRegimeResult(calc: any, regime: TaxRegime, assessmentYear: string) {
  const linesArray = Array.isArray(calc.lines) ? calc.lines : (Array.isArray(calc.lines?.create) ? calc.lines.create : []);
  const stdDedLine = linesArray.find((l: any) => l.lineCode === 'STANDARD_DEDUCTION' || l.lineCode === '16(ia)');
  const standardDeduction = stdDedLine ? Math.abs(Number(stdDedLine.amount)) : 0;
  const rebateLine = linesArray.find((l: any) => l.lineCode?.startsWith('REBATE_87A'));
  const rebate87A = rebateLine ? Math.abs(Number(rebateLine.amount)) : 0;
  const taxBeforeRebate = Number(calc.taxLiability) + rebate87A;
  const refundPayableNum = Number(calc.refundPayable);
  return {
    regime,
    assessmentYear,
    ruleVersion: calc.ruleVersion,
    grossIncome: Number(calc.grossIncome),
    standardDeduction,
    totalDeductions: Number(calc.totalDeductions),
    taxableIncome: Number(calc.taxableIncome),
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate: Number(calc.taxLiability),
    surcharge: Number(calc.surcharge),
    cess: Number(calc.cess),
    totalTax: Number(calc.totalTax),
    tdsDeducted: Number(calc.tdsDeducted),
    refundPayable: refundPayableNum,
    taxPayable: refundPayableNum > 0 ? refundPayableNum : 0,
    refund: refundPayableNum < 0 ? Math.abs(refundPayableNum) : 0,
    slabBreakdown: calc.slabBreakdown || [],
  };
}

export const compareRegimes = async (returnId: string, userId: string) => {
  const oldCalc = await calculateTax(returnId, userId, 'OLD');
  const newCalc = await calculateTax(returnId, userId, 'NEW');
  const ret = await getTaxReturn(returnId, userId);
  const canonicalYear = (ret.metadata as any)?.canonicalYear || ret.assessmentYear;
  return {
    assessmentYear: canonicalYear,
    ruleVersion: newCalc.ruleVersion,
    old: formatRegimeResult(oldCalc, 'OLD', canonicalYear),
    new: formatRegimeResult(newCalc, 'NEW', canonicalYear),
    recommendation: Number(oldCalc.totalTax) > Number(newCalc.totalTax) ? 'NEW' : 'OLD',
    saving: Math.abs(Number(oldCalc.totalTax) - Number(newCalc.totalTax)),
  };
};
