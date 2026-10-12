import { mapToSandboxItr, ITRValidationError } from './itr.mapper';
import { TaxReturn, IncomeEntry, Deduction } from '@prisma/client';

function assertStrictEqual(actual: any, expected: any) {
  if (actual !== expected) throw new Error(`Assertion failed: expected ${expected} but got ${actual}`);
}

function testMapperHappyPath() {
  const mockTaxReturn: TaxReturn = {
    id: 'tr-1',
    workspaceId: 'ws-1',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    returnType: 'ITR1',
    status: 'DRAFT',
    regime: 'NEW',
    readinessScore: 0,
    ackNumber: null,
    transactionId: null,
    filedAt: null, verificationStatus: "UNVERIFIED",
    metadata: {
      taxpayer: {
        pan: 'ABCDE1234F',
        fullName: 'John Doe',
        dateOfBirth: '1990-01-01'
      },
      bankAccounts: [
        {
          accountNumber: '123456789012',
          ifsc: 'HDFC0001234',
          accountType: 'SAVINGS',
          isRefundAccount: true
        }
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockIncomes: IncomeEntry[] = [
    {
      id: 'inc-1',
      taxReturnId: 'tr-1',
      incomeType: 'SALARY',
      source: 'Acme Corp',
      amount: 500000 as any,
      tdsDeducted: 50000 as any,
      assessmentYear: '2025-26',
      sourceDocumentId: null,
      notes: null,
      metadata: { employerCategory: 'OTHERS', deductorPan: 'ABCDE1234F' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'inc-2',
      taxReturnId: 'tr-1',
      incomeType: 'HOUSE_PROPERTY',
      source: 'Rental',
      amount: 120000 as any,
      tdsDeducted: null,
      assessmentYear: '2025-26',
      sourceDocumentId: null,
      notes: null,
      metadata: { 
        propertyType: 'LET_OUT', 
        address: { street: '123 Ln', city: 'Mumbai', state: 'MH', country: 'India', postalCode: '400001' } 
      } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockDeductions: Deduction[] = [
    {
      id: 'ded-1',
      taxReturnId: 'tr-1',
      section: 'SEC_80C',
      description: 'LIC Premium',
      claimedAmount: 150000 as any,
      eligibleAmount: 150000 as any,
      sourceDocumentId: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const payload = mapToSandboxItr(mockTaxReturn, mockIncomes, mockDeductions);

  assertStrictEqual(payload.incomes.length, 2);
  assertStrictEqual(payload.incomes[0].salary, 500000);
  assertStrictEqual(payload.incomes[0].employer_category, 'OTHERS');
  
  assertStrictEqual(payload.incomes[1].rent_received, 120000);
  assertStrictEqual(payload.incomes[1].address.city, 'Mumbai');

  assertStrictEqual(payload.tax_credits.length, 1);
  assertStrictEqual(payload.tax_credits[0].deductor, 'ABCDE1234F');

  assertStrictEqual(payload.chapter_vi_a_deductions.length, 1);
  assertStrictEqual(payload.chapter_vi_a_deductions[0].section, '80c');
}

function testMapperEdgeCases() {
  const mockTaxReturn: any = {
    assessmentYear: '2025-26',
    financialYear: '2024-25',
    metadata: {
      taxpayer: {
        pan: 'ABCDE1234F',
        fullName: 'John Doe',
        dateOfBirth: '1990-01-01'
      },
      bankAccounts: [
        {
          accountNumber: '123456789012',
          ifsc: 'HDFC0001234',
          accountType: 'SAVINGS',
          isRefundAccount: true
        }
      ]
    }
  };
  
  const incomes: any[] = [];
  const deductions: any[] = [];
  
  let errorCount = 0;

  // 1. Missing Amount
  incomes[0] = { id: 'bad-1', incomeType: 'SALARY', amount: null };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Invalid or missing amount'), true);
    errorCount++;
  }

  // 2. Negative Amount (Invalid)
  incomes[0] = { id: 'bad-2', incomeType: 'SALARY', amount: -500 };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Income amount cannot be negative'), true);
    errorCount++;
  }

  // 3. NaN/Malformed String Amount
  incomes[0] = { id: 'bad-3', incomeType: 'SALARY', amount: "five hundred" };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Invalid or missing amount'), true);
    errorCount++;
  }

  // 4. Missing Salary Employer Category
  incomes[0] = { id: 'bad-4', incomeType: 'SALARY', amount: 10000, metadata: {} };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Missing employerCategory'), true);
    errorCount++;
  }

  // 5. Missing Salary Employer Name (Source)
  incomes[0] = { id: 'bad-5', incomeType: 'SALARY', amount: 10000, source: null, metadata: { employerCategory: 'OTHERS' } };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Missing employer name'), true);
    errorCount++;
  }

  // 6. Missing House Property Type
  incomes[0] = { id: 'bad-6', incomeType: 'HOUSE_PROPERTY', amount: 10000, metadata: {} };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Missing propertyType'), true);
    errorCount++;
  }

  // 7. Missing House Property Address
  incomes[0] = { id: 'bad-7', incomeType: 'HOUSE_PROPERTY', amount: 10000, metadata: { propertyType: 'LET_OUT' } };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Missing or incomplete address'), true);
    errorCount++;
  }

  // 8. Unsupported Capital Gains
  incomes[0] = { id: 'bad-8', incomeType: 'CAPITAL_GAINS_SHORT', amount: 10000 };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Capital Gains income is not yet supported'), true);
    errorCount++;
  }

  // 9. Unsupported Business Income
  incomes[0] = { id: 'bad-9', incomeType: 'BUSINESS', amount: 10000 };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Business income is not yet supported'), true);
    errorCount++;
  }

  // 10. Missing TDS Deductor PAN
  incomes[0] = { id: 'bad-10', incomeType: 'OTHER_SOURCES', amount: 10000, tdsDeducted: 1000, metadata: { sourceType: 'xyz' } };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Missing deductorPan'), true);
    errorCount++;
  }

  // 11. Missing Deduction Amount
  incomes.length = 0;
  deductions[0] = { id: 'bad-11', section: 'SEC_80C', claimedAmount: null };
  try { mapToSandboxItr(mockTaxReturn, incomes, deductions); } catch (e: any) {
    assertStrictEqual(e.message.includes('Invalid or missing amount for deduction'), true);
    errorCount++;
  }

  assertStrictEqual(errorCount, 11);
  console.log('✅ ITR Mapper tests passed including explicit rejections & 11 edge cases!');
}

testMapperHappyPath();
testMapperEdgeCases();
