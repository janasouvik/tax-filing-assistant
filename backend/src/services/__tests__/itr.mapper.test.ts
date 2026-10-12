import { describe, it, expect } from 'vitest';
import {
  mapToSandboxItr,
  resolveFilingYear,
  resolveTaxpayerIdentity,
  resolveBankAccounts,
  ITRValidationError,
  SandboxItrPayload
} from '../itr.mapper';

describe('ITR Mapper - Targeted Verification Suite', () => {
  const validTaxpayer = {
    pan: 'ABCDE1234F',
    fullName: 'Rajesh Sharma',
    dateOfBirth: '1988-06-15'
  };

  const validBankAccounts = [
    {
      accountNumber: '123456789012',
      ifsc: 'HDFC0001234',
      accountType: 'SAVINGS',
      isRefundAccount: true
    }
  ];

  const createBaseReturn = (overrides: any = {}) => ({
    id: 'tr-test-1',
    workspaceId: 'ws-1',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    returnType: 'ITR1',
    status: 'DRAFT',
    regime: 'NEW',
    readinessScore: 0,
    ackNumber: null,
    transactionId: null,
    filedAt: null,
    verificationStatus: 'UNVERIFIED',
    metadata: {
      taxpayer: validTaxpayer,
      bankAccounts: validBankAccounts
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  // =========================================================================
  // 1. SUPPORTED YEAR MAPPINGS
  // =========================================================================
  describe('1. Supported Year Mappings', () => {
    it('maps AY 2025-26 (FY 2024-25) to reportYear 2025 and year_2025 entities', () => {
      const taxReturn = createBaseReturn({
        financialYear: '2024-25',
        assessmentYear: '2025-26'
      });
      const incomes = [
        {
          id: 'inc-1',
          taxReturnId: taxReturn.id,
          incomeType: 'SALARY',
          source: 'Acme Tech Pvt Ltd',
          amount: 1000000 as any,
          tdsDeducted: null,
          assessmentYear: '2025-26',
          sourceDocumentId: null,
          notes: null,
          metadata: { employerCategory: 'OTHERS' } as any,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const payload = mapToSandboxItr(taxReturn as any, incomes as any, []);

      expect(payload.reportYear).toBe('2025');
      expect(payload.taxpayer?.['@entity']).toBe('com.quicko.it.year_2025.taxpayer');
      expect(payload.incomes[0]['@entity']).toBe('com.quicko.it.year_2025.income.taxable_income.salary_income.salary');
      expect(payload.bank_accounts[0]['@entity']).toBe('com.quicko.it.year_2025.bank_account');
    });

    it('maps prefixed AY 2025-26 correctly', () => {
      const taxReturn = createBaseReturn({
        financialYear: '2024-25',
        assessmentYear: 'AY 2025-26'
      });
      const res = resolveFilingYear(taxReturn);
      expect(res.reportYear).toBe('2025');
      expect(res.yearNamespace).toBe('year_2025');
    });

    it('maps AY 2024-25 (FY 2023-24) to reportYear 2024 and year_2024 entities', () => {
      const taxReturn = createBaseReturn({
        financialYear: '2023-24',
        assessmentYear: '2024-25'
      });
      const incomes = [
        {
          id: 'inc-1',
          taxReturnId: taxReturn.id,
          incomeType: 'SALARY',
          source: 'Infosys Ltd',
          amount: 850000 as any,
          tdsDeducted: null,
          assessmentYear: '2024-25',
          sourceDocumentId: null,
          notes: null,
          metadata: { employerCategory: 'OTHERS' } as any,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const payload = mapToSandboxItr(taxReturn as any, incomes as any, []);

      expect(payload.reportYear).toBe('2024');
      expect(payload.taxpayer?.['@entity']).toBe('com.quicko.it.year_2024.taxpayer');
      expect(payload.incomes[0]['@entity']).toBe('com.quicko.it.year_2024.income.taxable_income.salary_income.salary');
      expect(payload.bank_accounts[0]['@entity']).toBe('com.quicko.it.year_2024.bank_account');
    });
  });

  // =========================================================================
  // 2. UNSUPPORTED FILING YEARS
  // =========================================================================
  describe('2. Unsupported Filing Years', () => {
    it('rejects AY 2026-27 with pending CBDT notification message', () => {
      const taxReturn = createBaseReturn({
        financialYear: '2025-26',
        assessmentYear: '2026-27'
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /ITR filing schemas for Assessment Year 2026-27 \/ Tax Year 2026-27 are pending official CBDT notification/
      );
    });

    it('rejects TY 2026-27 with pending CBDT notification message', () => {
      const taxReturn = createBaseReturn({
        financialYear: '2025-26',
        assessmentYear: 'TY 2026-27'
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /ITR filing schemas for Assessment Year 2026-27 \/ Tax Year 2026-27 are pending official CBDT notification/
      );
    });

    it('rejects older unsupported years (e.g. AY 2023-24)', () => {
      const taxReturn = createBaseReturn({
        financialYear: '2022-23',
        assessmentYear: '2023-24'
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Unsupported assessment year for ITR filing: 2023-24/
      );
    });

    it('rejects missing or unknown assessment year', () => {
      const taxReturn = createBaseReturn({
        financialYear: null,
        assessmentYear: null
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Unsupported assessment year for ITR filing: Unknown/
      );
    });
  });

  // =========================================================================
  // 3. MISSING REQUIRED TAXPAYER INFO
  // =========================================================================
  describe('3. Missing Required Taxpayer Info', () => {
    it('rejects filing when PAN is completely missing', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: { fullName: 'John Doe', dateOfBirth: '1990-01-01' },
          bankAccounts: validBankAccounts
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Missing or invalid taxpayer PAN/
      );
    });

    it('rejects filing when PAN format is invalid', () => {
      const invalidPans = ['12345ABCDE', 'ABCDE123', 'INVALIDPAN1', 'ABCDE12345'];
      for (const badPan of invalidPans) {
        const taxReturn = createBaseReturn({
          metadata: {
            taxpayer: { pan: badPan, fullName: 'John Doe', dateOfBirth: '1990-01-01' },
            bankAccounts: validBankAccounts
          }
        });
        expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
          /Missing or invalid taxpayer PAN/
        );
      }
    });

    it('rejects filing when full name is missing or empty', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: { pan: 'ABCDE1234F', fullName: '   ', dateOfBirth: '1990-01-01' },
          bankAccounts: validBankAccounts
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Missing taxpayer full name/
      );
    });

    it('rejects filing when date of birth is missing', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: { pan: 'ABCDE1234F', fullName: 'John Doe', dateOfBirth: null },
          bankAccounts: validBankAccounts
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Missing or invalid taxpayer date of birth/
      );
    });

    it('rejects filing when date of birth is an unparseable string', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: { pan: 'ABCDE1234F', fullName: 'John Doe', dateOfBirth: 'not-a-valid-date' },
          bankAccounts: validBankAccounts
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Missing or invalid taxpayer date of birth/
      );
    });

    it('successfully extracts taxpayer identity from options.profile if not in metadata', () => {
      const taxReturn = createBaseReturn({
        metadata: { bankAccounts: validBankAccounts }
      });
      const options = {
        profile: {
          pan: 'XYZPK9876Q',
          fullName: 'Priya Patel',
          dateOfBirth: new Date('1992-04-12')
        }
      };
      const payload = mapToSandboxItr(taxReturn as any, [], [], options);
      expect(payload.taxpayer?.pan).toBe('XYZPK9876Q');
      expect(payload.taxpayer?.full_name).toBe('Priya Patel');
      expect(payload.taxpayer?.date_of_birth).toBe('1992-04-12');
    });
  });

  // =========================================================================
  // 4. MISSING BANK INFO
  // =========================================================================
  describe('4. Missing Bank Info', () => {
    it('rejects filing when bankAccounts array is empty', () => {
      const taxReturn = createBaseReturn({
        metadata: { taxpayer: validTaxpayer, bankAccounts: [] }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /At least one bank account is required for ITR filing/
      );
    });

    it('rejects filing when no refund account is designated', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: validTaxpayer,
          bankAccounts: [
            {
              accountNumber: '123456789012',
              ifsc: 'HDFC0001234',
              accountType: 'SAVINGS',
              isRefundAccount: false
            }
          ]
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /At least one bank account must be designated as the refund account/
      );
    });
  });

  // =========================================================================
  // 5. INVALID BANK DATA
  // =========================================================================
  describe('5. Invalid Bank Data', () => {
    it('rejects account numbers with fewer than 9 digits', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: validTaxpayer,
          bankAccounts: [
            { accountNumber: '12345678', ifsc: 'SBIN0001234', isRefundAccount: true }
          ]
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Invalid bank account number "12345678"/
      );
    });

    it('rejects account numbers with more than 18 digits', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: validTaxpayer,
          bankAccounts: [
            { accountNumber: '1234567890123456789', ifsc: 'SBIN0001234', isRefundAccount: true }
          ]
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Invalid bank account number "1234567890123456789"/
      );
    });

    it('rejects account numbers containing non-digit characters', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: validTaxpayer,
          bankAccounts: [
            { accountNumber: '12345ABCDE', ifsc: 'SBIN0001234', isRefundAccount: true }
          ]
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Invalid bank account number "12345ABCDE"/
      );
    });

    it('rejects invalid IFSC codes (wrong format or length)', () => {
      const invalidIfscs = ['HDFC123', 'SBIN1001234', '12340001234', 'HDFC000123!'];
      for (const badIfsc of invalidIfscs) {
        const taxReturn = createBaseReturn({
          metadata: {
            taxpayer: validTaxpayer,
            bankAccounts: [
              { accountNumber: '123456789012', ifsc: badIfsc, isRefundAccount: true }
            ]
          }
        });
        expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
          /Invalid IFSC code/
        );
      }
    });

    it('rejects invalid account types (not SAVINGS or CURRENT)', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: validTaxpayer,
          bankAccounts: [
            {
              accountNumber: '123456789012',
              ifsc: 'HDFC0001234',
              accountType: 'OVERDRAFT',
              isRefundAccount: true
            }
          ]
        }
      });
      expect(() => mapToSandboxItr(taxReturn as any, [], [])).toThrow(
        /Invalid account type "OVERDRAFT"/
      );
    });

    it('successfully maps multiple valid bank accounts with correct properties', () => {
      const taxReturn = createBaseReturn({
        metadata: {
          taxpayer: validTaxpayer,
          bankAccounts: [
            {
              accountNumber: '123456789012',
              ifsc: 'HDFC0001234',
              accountType: 'SAVINGS',
              isRefundAccount: true
            },
            {
              accountNumber: '987654321098',
              ifsc: 'ICIC0005678',
              accountType: 'CURRENT',
              isRefundAccount: false
            }
          ]
        }
      });
      const payload = mapToSandboxItr(taxReturn as any, [], []);
      expect(payload.bank_accounts).toHaveLength(2);
      expect(payload.bank_accounts[0]).toEqual({
        '@entity': 'com.quicko.it.year_2025.bank_account',
        account_number: '123456789012',
        ifsc: 'HDFC0001234',
        account_type: 'savings',
        is_refund_account: true
      });
      expect(payload.bank_accounts[1]).toEqual({
        '@entity': 'com.quicko.it.year_2025.bank_account',
        account_number: '987654321098',
        ifsc: 'ICIC0005678',
        account_type: 'current',
        is_refund_account: false
      });
    });
  });

  // =========================================================================
  // 6. SUPPORTED INCOME / DEDUCTION MAPPINGS
  // =========================================================================
  describe('6. Supported Income & Deduction Mappings', () => {
    it('maps Salary income with employer details and TDS credits correctly', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        {
          id: 'inc-sal',
          taxReturnId: taxReturn.id,
          incomeType: 'SALARY',
          source: 'Tata Consultancy Services',
          amount: 1200000 as any,
          tdsDeducted: 80000 as any,
          assessmentYear: '2025-26',
          sourceDocumentId: null,
          notes: null,
          metadata: {
            employerCategory: 'OTHERS',
            deductorPan: 'TCS123456A'
          } as any,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const payload = mapToSandboxItr(taxReturn as any, incomes as any, []);

      expect(payload.incomes[0]).toEqual({
        '@entity': 'com.quicko.it.year_2025.income.taxable_income.salary_income.salary',
        salary: 1200000,
        employer_category: 'OTHERS',
        employer_name: 'Tata Consultancy Services'
      });

      expect(payload.tax_credits[0]).toEqual({
        '@entity': 'com.quicko.it.year_2025.tax_credit.tds',
        tax_amount: 80000,
        credit_amount: 80000,
        deductor: 'TCS123456A',
        assessment_year: '2025-26',
        financial_year: '2024-25'
      });
    });

    it('rejects Salary income missing employerCategory', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        {
          id: 'inc-sal-bad',
          taxReturnId: taxReturn.id,
          incomeType: 'SALARY',
          source: 'Tata Consultancy Services',
          amount: 1200000 as any,
          tdsDeducted: null,
          assessmentYear: '2025-26',
          metadata: {} as any
        }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Missing employerCategory in metadata for Salary income inc-sal-bad/
      );
    });

    it('maps House Property LET_OUT and SELF_OCCUPIED incomes with structured addresses', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        {
          id: 'inc-hp-1',
          taxReturnId: taxReturn.id,
          incomeType: 'HOUSE_PROPERTY',
          amount: 240000 as any,
          tdsDeducted: null,
          assessmentYear: '2025-26',
          metadata: {
            propertyType: 'LET_OUT',
            address: {
              street: '42 Marine Drive',
              city: 'Mumbai',
              state: 'MH',
              country: 'India',
              postalCode: '400020'
            }
          } as any
        },
        {
          id: 'inc-hp-2',
          taxReturnId: taxReturn.id,
          incomeType: 'HOUSE_PROPERTY',
          amount: 0 as any,
          tdsDeducted: null,
          assessmentYear: '2025-26',
          metadata: {
            propertyType: 'SELF_OCCUPIED',
            address: {
              street: '15 MG Road',
              city: 'Bengaluru',
              state: 'KA',
              country: 'India',
              postalCode: '560001'
            }
          } as any
        }
      ];

      const payload = mapToSandboxItr(taxReturn as any, incomes as any, []);

      expect(payload.incomes[0]['@entity']).toBe(
        'com.quicko.it.year_2025.income.taxable_income.house_property_income.let_out'
      );
      expect(payload.incomes[0].rent_received).toBe(240000);
      expect(payload.incomes[0].address.city).toBe('Mumbai');

      expect(payload.incomes[1]['@entity']).toBe(
        'com.quicko.it.year_2025.income.taxable_income.house_property_income.self_occupied'
      );
      expect(payload.incomes[1].rent_received).toBeUndefined();
      expect(payload.incomes[1].address.city).toBe('Bengaluru');
    });

    it('rejects House Property missing address fields', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        {
          id: 'inc-hp-bad',
          taxReturnId: taxReturn.id,
          incomeType: 'HOUSE_PROPERTY',
          amount: 100000 as any,
          metadata: { propertyType: 'LET_OUT', address: { street: '123 Lane' } } as any
        }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Missing or incomplete address in metadata for House Property income inc-hp-bad/
      );
    });

    it('maps Chapter VI-A deductions and normalizes section keys', () => {
      const taxReturn = createBaseReturn();
      const deductions = [
        {
          id: 'ded-1',
          taxReturnId: taxReturn.id,
          section: 'SEC_80C',
          description: 'PPF and ELSS',
          claimedAmount: 150000 as any,
          eligibleAmount: 150000 as any,
          sourceDocumentId: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'ded-2',
          taxReturnId: taxReturn.id,
          section: 'SEC_80D',
          description: 'Health Insurance',
          claimedAmount: 25000 as any,
          eligibleAmount: 25000 as any,
          sourceDocumentId: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const payload = mapToSandboxItr(taxReturn as any, [], deductions as any);

      expect(payload.chapter_vi_a_deductions).toHaveLength(2);
      expect(payload.chapter_vi_a_deductions[0]).toEqual({
        '@entity': 'com.quicko.it.year_2025.deduction.chapter_vi_a_deduction',
        section: '80c',
        amount: 150000
      });
      expect(payload.chapter_vi_a_deductions[1]).toEqual({
        '@entity': 'com.quicko.it.year_2025.deduction.chapter_vi_a_deduction',
        section: '80d',
        amount: 25000
      });
    });
  });

  // =========================================================================
  // 7. UNSUPPORTED INCOME CATEGORIES & INVALID VALUES
  // =========================================================================
  describe('7. Unsupported Income Categories & Negative Values', () => {
    it('rejects CAPITAL_GAINS_SHORT income with clear error', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        { id: 'cg-1', taxReturnId: taxReturn.id, incomeType: 'CAPITAL_GAINS_SHORT', amount: 50000 as any }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Capital Gains income is not yet supported for ITR mapping/
      );
    });

    it('rejects CAPITAL_GAINS_LONG income with clear error', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        { id: 'cg-2', taxReturnId: taxReturn.id, incomeType: 'CAPITAL_GAINS_LONG', amount: 75000 as any }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Capital Gains income is not yet supported for ITR mapping/
      );
    });

    it('rejects BUSINESS income with clear error', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        { id: 'biz-1', taxReturnId: taxReturn.id, incomeType: 'BUSINESS', amount: 200000 as any }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Business income is not yet supported for ITR mapping/
      );
    });

    it('rejects negative income amounts', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        { id: 'neg-1', taxReturnId: taxReturn.id, incomeType: 'SALARY', amount: -5000 as any }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Income amount cannot be negative for entry neg-1/
      );
    });

    it('rejects negative deduction amounts', () => {
      const taxReturn = createBaseReturn();
      const deductions = [
        { id: 'ded-neg-1', taxReturnId: taxReturn.id, section: 'SEC_80C', claimedAmount: -10000 as any }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, [], deductions as any)).toThrow(
        /Deduction amount cannot be negative for entry ded-neg-1/
      );
    });

    it('rejects non-numeric / NaN amounts', () => {
      const taxReturn = createBaseReturn();
      const incomes = [
        { id: 'nan-1', taxReturnId: taxReturn.id, incomeType: 'SALARY', amount: 'abc' as any }
      ];
      expect(() => mapToSandboxItr(taxReturn as any, incomes as any, [])).toThrow(
        /Invalid or missing amount for income entry nan-1/
      );
    });
  });
});
