import { TaxReturn, IncomeEntry, Deduction } from '@prisma/client';

export interface TaxpayerIdentity {
  pan?: string | null;
  fullName?: string | null;
  dateOfBirth?: Date | string | null;
}

export interface BankAccountInput {
  accountNumber?: string | null;
  ifsc?: string | null;
  accountType?: 'SAVINGS' | 'CURRENT' | string | null;
  isRefundAccount?: boolean | null;
}

export interface MapToSandboxItrOptions {
  profile?: TaxpayerIdentity | any | null;
  bankAccounts?: BankAccountInput[] | null;
}

export interface SandboxItrPayload {
  taxpayer?: {
    "@entity": string;
    pan: string;
    full_name: string;
    date_of_birth: string;
    [key: string]: any;
  };
  incomes: any[];
  chapter_vi_a_deductions: any[];
  tax_credits: any[];
  bank_accounts: any[];
  businesses: any[];
  reportYear?: string;
  assessment_year?: string;
  financial_year?: string;
}

export class ITRValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ITRValidationError';
  }
}

/**
 * Resolves the filing report year and Quicko schema entity namespace.
 * Supported years:
 * - AY 2025-26 (FY 2024-25) -> reportYear: '2025', namespace: 'year_2025'
 * - AY 2024-25 (FY 2023-24) -> reportYear: '2024', namespace: 'year_2024'
 * 
 * Rejections:
 * - AY 2026-27 / TY 2026-27 (FY 2025-26) -> Pending official CBDT notification
 * - Other years -> Unsupported assessment year
 */
export function resolveFilingYear(taxReturn: { assessmentYear?: string | null; financialYear?: string | null }): {
  reportYear: string;
  yearNamespace: string;
} {
  const ayRaw = taxReturn.assessmentYear?.trim() || '';
  const fyRaw = taxReturn.financialYear?.trim() || '';

  // Check for AY 2026-27 / TY 2026-27 / FY 2025-26 (Income-tax Act, 2025 transition)
  if (
    /^(?:AY\s*|TY\s*)?2026-27/i.test(ayRaw) ||
    /^(?:AY\s*|TY\s*)?2026/i.test(ayRaw) ||
    /^(?:FY\s*)?2025-26/i.test(fyRaw) ||
    ayRaw.toUpperCase().includes('2026-27') ||
    ayRaw.toUpperCase().includes('TY 2026')
  ) {
    throw new ITRValidationError(
      'ITR filing schemas for Assessment Year 2026-27 / Tax Year 2026-27 are pending official CBDT notification. Filing is not yet supported for this year.'
    );
  }

  // Check for supported AY 2025-26 (FY 2024-25)
  if (/^(?:AY\s*)?2025-26/i.test(ayRaw) || /^(?:FY\s*)?2024-25/i.test(fyRaw)) {
    return {
      reportYear: '2025',
      yearNamespace: 'year_2025',
    };
  }

  // Check for supported AY 2024-25 (FY 2023-24)
  if (/^(?:AY\s*)?2024-25/i.test(ayRaw) || /^(?:FY\s*)?2023-24/i.test(fyRaw)) {
    return {
      reportYear: '2024',
      yearNamespace: 'year_2024',
    };
  }

  throw new ITRValidationError(
    `Unsupported assessment year for ITR filing: ${taxReturn.assessmentYear || taxReturn.financialYear || 'Unknown'}. Supported assessment years are 2024-25 and 2025-26.`
  );
}

/**
 * Validates and extracts mandatory taxpayer identity information (PAN, Full Name, DOB).
 */
export function resolveTaxpayerIdentity(
  taxReturn: TaxReturn & { workspace?: any },
  options?: MapToSandboxItrOptions
): { pan: string; fullName: string; dateOfBirth: string } {
  const metadata: any = typeof taxReturn.metadata === 'object' && taxReturn.metadata !== null ? taxReturn.metadata : {};
  const metaTaxpayer: any = metadata.taxpayer || metadata.profile || {};
  const optProfile: any = options?.profile || {};
  const wsProfile: any = taxReturn.workspace?.taxpayerProfile || {};
  const wsPanVerification: any = wsProfile.panVerification || {};

  // 1. PAN validation
  const rawPan = (
    optProfile.pan ||
    metaTaxpayer.pan ||
    wsPanVerification.pan ||
    taxReturn.workspace?.pan ||
    ''
  ).toString().trim().toUpperCase();

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!rawPan || !panRegex.test(rawPan)) {
    throw new ITRValidationError(
      `Missing or invalid taxpayer PAN "${rawPan}". A valid 10-character PAN is required for ITR filing.`
    );
  }

  // 2. Full Name validation
  const rawFullName = (
    optProfile.fullName ||
    optProfile.name ||
    metaTaxpayer.fullName ||
    metaTaxpayer.name ||
    wsProfile.fullName ||
    wsPanVerification.fullName ||
    wsPanVerification.verifiedName ||
    taxReturn.workspace?.name ||
    ''
  ).toString().trim();

  if (!rawFullName) {
    throw new ITRValidationError(
      'Missing taxpayer full name. Taxpayer full name is required for ITR filing.'
    );
  }

  // 3. Date of Birth validation
  const rawDob =
    optProfile.dateOfBirth ||
    optProfile.dob ||
    metaTaxpayer.dateOfBirth ||
    metaTaxpayer.dob ||
    wsProfile.dateOfBirth ||
    wsPanVerification.verifiedDob ||
    wsPanVerification.submittedDob;

  if (!rawDob) {
    throw new ITRValidationError(
      'Missing or invalid taxpayer date of birth. Taxpayer date of birth is required for ITR filing.'
    );
  }

  let formattedDob = '';
  if (rawDob instanceof Date) {
    if (isNaN(rawDob.getTime())) {
      throw new ITRValidationError(
        'Missing or invalid taxpayer date of birth. Taxpayer date of birth is required for ITR filing.'
      );
    }
    formattedDob = rawDob.toISOString().split('T')[0];
  } else if (typeof rawDob === 'string') {
    const trimmed = rawDob.trim();
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      throw new ITRValidationError(
        `Missing or invalid taxpayer date of birth "${trimmed}". Taxpayer date of birth is required for ITR filing.`
      );
    }
    formattedDob = d.toISOString().split('T')[0];
  } else {
    throw new ITRValidationError(
      'Missing or invalid taxpayer date of birth. Taxpayer date of birth is required for ITR filing.'
    );
  }

  return {
    pan: rawPan,
    fullName: rawFullName,
    dateOfBirth: formattedDob,
  };
}

/**
 * Validates and maps mandatory taxpayer bank accounts (Account number, IFSC, Refund designation).
 */
export function resolveBankAccounts(
  taxReturn: TaxReturn,
  options?: MapToSandboxItrOptions,
  yearNamespace: string = 'year_2025'
): any[] {
  const metadata: any = typeof taxReturn.metadata === 'object' && taxReturn.metadata !== null ? taxReturn.metadata : {};
  const accounts: any[] = (options?.bankAccounts && Array.isArray(options.bankAccounts) && options.bankAccounts.length > 0)
    ? options.bankAccounts
    : (Array.isArray(metadata.bankAccounts) && metadata.bankAccounts.length > 0)
    ? metadata.bankAccounts
    : (Array.isArray(metadata.bank_accounts) && metadata.bank_accounts.length > 0)
    ? metadata.bank_accounts
    : [];

  if (accounts.length === 0) {
    throw new ITRValidationError('At least one bank account is required for ITR filing.');
  }

  const mappedAccounts: any[] = [];
  let hasRefundAccount = false;

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const accNum = (acc.accountNumber || acc.account_number || '').toString().trim();
    if (!accNum || !/^\d{9,18}$/.test(accNum)) {
      throw new ITRValidationError(
        `Invalid bank account number "${accNum}". Account number must be between 9 and 18 digits.`
      );
    }

    const ifsc = (acc.ifsc || '').toString().trim().toUpperCase();
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      throw new ITRValidationError(
        `Invalid IFSC code "${ifsc}". Must be 11 characters starting with 4 alphabets followed by 0 and 6 alphanumeric characters.`
      );
    }

    const rawType = (acc.accountType || acc.account_type || 'SAVINGS').toString().trim().toUpperCase();
    if (rawType !== 'SAVINGS' && rawType !== 'CURRENT') {
      throw new ITRValidationError(
        `Invalid account type "${rawType}". Account type must be SAVINGS or CURRENT.`
      );
    }

    const isRefund = Boolean(acc.isRefundAccount ?? acc.is_refund_account);
    if (isRefund) {
      hasRefundAccount = true;
    }

    mappedAccounts.push({
      "@entity": `com.quicko.it.${yearNamespace}.bank_account`,
      account_number: accNum,
      ifsc: ifsc,
      account_type: rawType.toLowerCase(),
      is_refund_account: isRefund
    });
  }

  if (!hasRefundAccount) {
    throw new ITRValidationError('At least one bank account must be designated as the refund account.');
  }

  return mappedAccounts;
}

/**
 * Maps the internal TaxReturn, IncomeEntries, Deductions, and Taxpayer identity/bank data
 * to the dynamic Sandbox ITR generation payload format.
 */
export const mapToSandboxItr = (
  taxReturn: TaxReturn & { workspace?: any },
  incomes: IncomeEntry[],
  deductions: Deduction[],
  options?: MapToSandboxItrOptions
): SandboxItrPayload => {
  // 1. Resolve Filing Year & Namespace
  const { reportYear, yearNamespace } = resolveFilingYear(taxReturn);

  // 2. Validate & Resolve Taxpayer Identity
  const taxpayer = resolveTaxpayerIdentity(taxReturn, options);

  // 3. Validate & Resolve Bank Accounts
  const bankAccounts = resolveBankAccounts(taxReturn, options, yearNamespace);

  const payload: SandboxItrPayload = {
    taxpayer: {
      "@entity": `com.quicko.it.${yearNamespace}.taxpayer`,
      pan: taxpayer.pan,
      full_name: taxpayer.fullName,
      date_of_birth: taxpayer.dateOfBirth,
    },
    incomes: [],
    chapter_vi_a_deductions: [],
    tax_credits: [],
    bank_accounts: bankAccounts,
    businesses: [],
    reportYear,
    assessment_year: taxReturn.assessmentYear,
    financial_year: taxReturn.financialYear,
  };

  for (const inc of incomes) {
    if (inc.amount == null || isNaN(Number(inc.amount))) {
      throw new ITRValidationError(`Invalid or missing amount for income entry ${inc.id}`);
    }
    const amt = parseFloat(inc.amount.toString());
    if (amt < 0) {
      throw new ITRValidationError(`Income amount cannot be negative for entry ${inc.id}`);
    }

    const metadata: any = typeof inc.metadata === 'object' && inc.metadata !== null ? inc.metadata : {};

    if (inc.incomeType === 'SALARY') {
      if (!metadata.employerCategory) {
        throw new ITRValidationError(`Missing employerCategory in metadata for Salary income ${inc.id}`);
      }
      if (!inc.source && !metadata.employerName) {
        throw new ITRValidationError(`Missing employer name (source) for Salary income ${inc.id}`);
      }
      
      payload.incomes.push({
        "@entity": `com.quicko.it.${yearNamespace}.income.taxable_income.salary_income.salary`,
        salary: amt,
        employer_category: metadata.employerCategory,
        employer_name: inc.source || metadata.employerName
      });
    } else if (inc.incomeType === 'HOUSE_PROPERTY') {
      if (!metadata.propertyType) {
        throw new ITRValidationError(`Missing propertyType in metadata for House Property income ${inc.id}`);
      }
      if (!metadata.address || !metadata.address.street || !metadata.address.city || !metadata.address.state || !metadata.address.country || !metadata.address.postalCode) {
        throw new ITRValidationError(`Missing or incomplete address in metadata for House Property income ${inc.id}`);
      }
      
      const entityType = metadata.propertyType === 'LET_OUT' 
        ? `com.quicko.it.${yearNamespace}.income.taxable_income.house_property_income.let_out`
        : `com.quicko.it.${yearNamespace}.income.taxable_income.house_property_income.self_occupied`;

      payload.incomes.push({
        "@entity": entityType,
        rent_received: metadata.propertyType === 'LET_OUT' ? amt : undefined,
        address: {
           "@entity": "org.quicko.address",
           street: metadata.address.street,
           city: metadata.address.city,
           state: metadata.address.state,
           country: metadata.address.country,
           postal_code: metadata.address.postalCode
        }
      });
    } else if (inc.incomeType === 'OTHER_SOURCES' || inc.incomeType === 'FREELANCE') {
      if (!metadata.sourceType) {
        throw new ITRValidationError(`Missing sourceType in metadata for Other Sources income ${inc.id}`);
      }
      const entityType = metadata.sourceType.replace(/year_\d{4}/, yearNamespace);
      payload.incomes.push({
        "@entity": entityType,
        amount: amt
      });
    } else if (inc.incomeType === 'CAPITAL_GAINS_SHORT' || inc.incomeType === 'CAPITAL_GAINS_LONG') {
      throw new ITRValidationError(`Capital Gains income is not yet supported for ITR mapping (entry ${inc.id})`);
    } else if (inc.incomeType === 'BUSINESS') {
      throw new ITRValidationError(`Business income is not yet supported for ITR mapping (entry ${inc.id})`);
    } else {
      throw new ITRValidationError(`Unsupported income type: ${inc.incomeType} for entry ${inc.id}`);
    }
    
    if (inc.tdsDeducted != null) {
      const tdsAmt = parseFloat(inc.tdsDeducted.toString());
      if (!isNaN(tdsAmt) && tdsAmt > 0) {
        if (!metadata.deductorPan) {
           throw new ITRValidationError(`Missing deductorPan in metadata for TDS on income ${inc.id}`);
        }
        payload.tax_credits.push({
          "@entity": `com.quicko.it.${yearNamespace}.tax_credit.tds`,
          tax_amount: tdsAmt,
          credit_amount: tdsAmt,
          deductor: metadata.deductorPan,
          assessment_year: taxReturn.assessmentYear,
          financial_year: taxReturn.financialYear
        });
      }
    }
  }

  for (const ded of deductions) {
    if (ded.claimedAmount == null || isNaN(Number(ded.claimedAmount))) {
      throw new ITRValidationError(`Invalid or missing amount for deduction ${ded.id}`);
    }
    const amt = parseFloat(ded.claimedAmount.toString());
    if (amt < 0) {
      throw new ITRValidationError(`Deduction amount cannot be negative for entry ${ded.id}`);
    }
    
    let mappedSection = ded.section.replace('SEC_', '').toLowerCase(); 
    payload.chapter_vi_a_deductions.push({
      "@entity": `com.quicko.it.${yearNamespace}.deduction.chapter_vi_a_deduction`,
      section: mappedSection,
      amount: amt
    });
  }

  return payload;
};
