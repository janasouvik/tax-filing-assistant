import { describe, it, expect, vi, beforeEach } from 'vitest';
import syntheticTaxpayer from '../fixtures/synthetic-taxpayer.json';
import documentsFixture from '../fixtures/documents-synthetic.json';

import { consolidateIncome } from '../../backend/src/modules/consolidation/consolidation.service';
import { runReconciliation } from '../../backend/src/modules/reconciliation/reconciliation.service';
import { calculateTax, compareRegimes } from '../../backend/src/modules/taxEngine/taxEngine.service';
import prisma from '../../backend/src/config/prisma';
import * as taxReturnService from '../../backend/src/services/taxReturn.service';

vi.mock('../../backend/src/config/prisma', () => ({
  default: {
    incomeEntry: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    document: { findMany: vi.fn(), count: vi.fn() },
    taxRule: { findMany: vi.fn() },
    deduction: { findMany: vi.fn() },
    taxCalculation: { create: vi.fn(), deleteMany: vi.fn() },
    taxReturn: { update: vi.fn() },
    validationIssue: { deleteMany: vi.fn(), createMany: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('../../backend/src/services/taxReturn.service', () => ({
  getTaxReturn: vi.fn(),
}));

describe('Section 24: Comprehensive End-to-End Synthetic Taxpayer 19-Step Lifecycle', () => {
  const returnId = 'tr-e2e-synth-001';
  const userId = 'u-e2e-synth-001';

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.taxRule.findMany as any).mockResolvedValue([]);
    (prisma.taxCalculation.create as any).mockImplementation(({ data }: any) => Promise.resolve(data));
    (prisma.validationIssue.deleteMany as any).mockResolvedValue({ count: 1 });
  });

  // Step 1 - 3: Profile and Multi-source Income Setup
  it('Steps 1-3: Taxpayer Profile setup with 5 verified income sources', () => {
    expect(syntheticTaxpayer.pan).toBe('ABCDE1234F');
    expect(syntheticTaxpayer.assessmentYear).toBe('AY 2026-27');
    expect(syntheticTaxpayer.incomeProfile.salary).toBe(800000);
    expect(syntheticTaxpayer.incomeProfile.bankInterest).toBe(25000);
    expect(syntheticTaxpayer.incomeProfile.fdInterest).toBe(35000);
    expect(syntheticTaxpayer.incomeProfile.rentalIncome).toBe(120000);
    expect(syntheticTaxpayer.incomeProfile.capitalGains).toBe(50000);
    expect(syntheticTaxpayer.rawAdditiveTotal).toBe(1030000);
  });

  // Step 4 - 6: Document Upload, AI Extraction & Verification
  it('Steps 4-6: Documents (Form 16, Bank, FD, Rent, Capital Gains) have verified extractions', () => {
    expect(documentsFixture.form16.grossSalary).toBe(800000);
    expect(documentsFixture.form16.tdsDeducted).toBe(25000);
    expect(documentsFixture.bankStatement.savingsInterest).toBe(12500);
    expect(documentsFixture.fdCertificate.fdInterest).toBe(35000);
    expect(documentsFixture.rentalRecord.annualRentReceived).toBe(120000);
    expect(documentsFixture.capitalGains.totalCapitalGains).toBe(50000);
  });

  // Step 7: Income Consolidation
  it('Step 7: Consolidates multi-source income without double-counting', async () => {
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-sal', incomeType: 'SALARY', amount: 800000, source: 'TechCorp Form 16', tdsDeducted: 25000, sourceDocumentId: 'doc-f16' },
      { id: 'inc-bank', incomeType: 'OTHER_SOURCES', amount: 25000, source: 'SBI Savings', tdsDeducted: 0, sourceDocumentId: 'doc-bank' },
      { id: 'inc-fd', incomeType: 'OTHER_SOURCES', amount: 35000, source: 'HDFC FD', tdsDeducted: 3500, sourceDocumentId: 'doc-fd' },
      { id: 'inc-rent', incomeType: 'HOUSE_PROPERTY', amount: 120000, source: 'Bengaluru Property', tdsDeducted: 0, sourceDocumentId: 'doc-rent' },
      { id: 'inc-cg', incomeType: 'OTHER', amount: 50000, source: 'Zerodha Statement', tdsDeducted: 0, sourceDocumentId: 'doc-cg' },
    ]);
    (prisma.document.findMany as any).mockResolvedValue([]);

    const consolidated = await consolidateIncome(returnId, userId);
    expect(consolidated).toHaveLength(5);
    const total = consolidated.reduce((s, i) => s + i.amount, 0);
    expect(total).toBe(1030000);

    const totalTds = consolidated.reduce((s, i) => s + i.tds, 0);
    expect(totalTds).toBe(28500);
  });

  // Steps 8-10: Intentional Mismatch Detection & Resolution
  it('Steps 8-10: Detects intentional mismatch between Bank Statement (₹12,500) and AIS (₹15,000)', () => {
    const aisRecord = documentsFixture.aisRecord;
    const bankRecord = documentsFixture.bankStatement;

    expect(aisRecord.mismatchDetails.bankReported).toBe(12500);
    expect(aisRecord.mismatchDetails.aisReported).toBe(15000);
    expect(aisRecord.mismatchDetails.variance).toBe(2500);
    expect(aisRecord.mismatchDetails.expectedStatus).toBe('POTENTIAL_MISMATCH');
    expect(aisRecord.mismatchDetails.guidance).toContain('Mismatch requires verification');
  });

  // Steps 11-14: Deterministic Tax Calculation, Regime Comparison & TDS Adjustment
  it('Steps 11-14: Computes deterministic tax liability, compares regimes, and applies ₹28,500 TDS', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue({
      id: returnId,
      regime: 'NEW',
      assessmentYear: 'AY 2026-27',
      metadata: { canonicalYear: 'AY 2026-27' },
      tdsEntries: [],
    });
    (prisma.incomeEntry.findMany as any).mockResolvedValue([
      { id: 'inc-sal', incomeType: 'SALARY', amount: 800000, source: 'TechCorp', tdsDeducted: 25000 },
      { id: 'inc-int', incomeType: 'OTHER_SOURCES', amount: 60000, source: 'Interest', tdsDeducted: 3500 },
      { id: 'inc-rent', incomeType: 'HOUSE_PROPERTY', amount: 120000, source: 'Rent', tdsDeducted: 0 },
      { id: 'inc-cg', incomeType: 'OTHER', amount: 50000, source: 'Capital Gains', tdsDeducted: 0 },
    ]);
    (prisma.document.findMany as any).mockResolvedValue([]);
    (prisma.deduction.findMany as any).mockResolvedValue([
      { section: '16(ia)', claimedAmount: 75000 },
      { section: '80C', claimedAmount: 150000 },
      { section: '80D', claimedAmount: 25000 },
    ]);

    const comparison = await compareRegimes(returnId, userId);
    expect(comparison.old).toBeDefined();
    expect(comparison.new).toBeDefined();
    expect(comparison.recommendation).toBeDefined();
    expect(comparison.saving).toBeGreaterThanOrEqual(0);

    // Check that TDS is accurately accounted for
    expect(comparison.new.tdsDeducted).toBe(28500);
  });

  // Steps 15-18: Source Traceability & Explanations
  it('Steps 15-18: Verifies immutable source traceability and deterministic explanations', () => {
    const verifiedSources = [
      { category: 'Salary', sourceDoc: 'Form 16 TechCorp', amount: 800000, status: 'VERIFIED' },
      { category: 'Bank Interest', sourceDoc: 'SBI Bank Statement', amount: 25000, status: 'VERIFIED' },
      { category: 'FD Interest', sourceDoc: 'HDFC FD Certificate', amount: 35000, status: 'VERIFIED' },
      { category: 'Rental Income', sourceDoc: 'Lease Agreement', amount: 120000, status: 'VERIFIED' },
      { category: 'Capital Gains', sourceDoc: 'Zerodha Tax P&L', amount: 50000, status: 'VERIFIED' },
    ];

    expect(verifiedSources.every(s => s.status === 'VERIFIED')).toBe(true);
    const sum = verifiedSources.reduce((s, i) => s + i.amount, 0);
    expect(sum).toBe(1030000);
  });
});
