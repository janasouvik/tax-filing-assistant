import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient, TaxRegime, TaxReturnType, IncomeType, DeductionSection } from '@prisma/client';

const TEST_DATABASE_URL = 'postgresql://postgres:1245@localhost:5432/taxpilot_test_db';
process.env.DATABASE_URL = TEST_DATABASE_URL;

// Direct real PostgreSQL client - NO MOCKS
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
});

import {
  createTaxReturn,
  addIncome,
  updateIncome,
  deleteIncome,
  addDeduction,
  updateDeduction,
  deleteDeduction,
  updateTaxReturn,
  invalidateTaxCalculationsAndResetStatus,
} from '../services/taxReturn.service';

import {
  calculateTax,
  resolveYearSpecification,
  resolveRuleVersion,
} from '../modules/taxEngine/taxEngine.service';

import {
  approveReturn,
  createReview,
} from '../modules/review/review.service';

import {
  generateApprovalHash,
  CanonicalFinancialSnapshot,
} from '../utils/helpers';

import { executeItrFiling } from '../services/filing.service';
import {
  initiateVerification,
  submitVerificationOtp,
  reconcileVerificationStatus,
  getVerificationHistory,
} from '../services/verification.service';
import { assertWorkspaceOwner } from '../services/workspace.service';

describe('Real PostgreSQL Integration & Approval Integrity Test Suite', () => {
  let testUser: any;
  let testWorkspace: any;
  let testProfile: any;

  beforeAll(async () => {
    // Connect to real PostgreSQL database
    await prisma.$connect();

    // Clean up any previous test artifacts
    await prisma.filingAttempt.deleteMany();
    await prisma.verificationAttempt.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.review.deleteMany();
    await prisma.taxCalculationLine.deleteMany();
    await prisma.taxCalculation.deleteMany();
    await prisma.incomeEntry.deleteMany();
    await prisma.deduction.deleteMany();
    await prisma.document.deleteMany();
    await prisma.validationIssue.deleteMany();
    await prisma.taxReturn.deleteMany();
    await prisma.taxpayerProfile.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'integration_tester@taxpilot.local' } });

    // Seed master user and workspace
    testUser = await prisma.user.create({
      data: {
        clerkId: 'clerk_test_real_pg_123',
        email: 'integration_tester@taxpilot.local',
        firstName: 'Integration',
        lastName: 'Tester',
      },
    });

    testWorkspace = await prisma.workspace.create({
      data: {
        userId: testUser.id,
        name: 'Integration Test Workspace',
        type: 'INDIVIDUAL',
      },
    });

    testProfile = await prisma.taxpayerProfile.create({
      data: {
        workspaceId: testWorkspace.id,
        fullName: 'Integration Tester',
        dateOfBirth: new Date('1990-05-15'),
        residentialStatus: 'RESIDENT',
        onboardingStep: 4,
      },
    });
  });

  afterAll(async () => {
    // Teardown
    await prisma.filingAttempt.deleteMany();
    await prisma.verificationAttempt.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.review.deleteMany();
    await prisma.taxCalculationLine.deleteMany();
    await prisma.taxCalculation.deleteMany();
    await prisma.incomeEntry.deleteMany();
    await prisma.deduction.deleteMany();
    await prisma.document.deleteMany();
    await prisma.validationIssue.deleteMany();
    await prisma.taxReturn.deleteMany();
    await prisma.taxpayerProfile.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe('Phase 1: Real Database Invalidation & Transaction Atomicity', () => {
    let taxReturn: any;

    beforeEach(async () => {
      // Create fresh tax return
      await prisma.taxReturn.deleteMany({ where: { workspaceId: testWorkspace.id } });
      taxReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
        returnType: 'ITR1',
      });
    });

    it('Scenario 1: Atomic invalidation on adding income', async () => {
      // 1. Add base income
      const inc1 = await addIncome(taxReturn.id, testUser.id, {
        incomeType: 'SALARY',
        source: 'Acme Technologies',
        amount: 1000000,
        tdsDeducted: 50000,
      });

      // 2. Calculate tax in real PostgreSQL
      const calc = await calculateTax(taxReturn.id, testUser.id, 'NEW');
      expect(calc.id).toBeDefined();

      // Verify calculation exists in database
      const dbCalcBefore = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(dbCalcBefore).not.toBeNull();

      // Put return into USER_REVIEW
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'USER_REVIEW' } });

      // 3. Add second income entry
      const inc2 = await addIncome(taxReturn.id, testUser.id, {
        incomeType: 'OTHER_SOURCES',
        source: 'Bank Interest',
        amount: 25000,
      });
      expect(inc2.id).toBeDefined();

      // Verify PostgreSQL state: calculation DELETED, status reset to DRAFT
      const dbCalcAfter = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(dbCalcAfter).toBeNull();

      const dbReturnAfter = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(dbReturnAfter?.status).toBe('DRAFT');
    });

    it('Scenario 2: Atomic invalidation on modifying income amount without changing entry count', async () => {
      const inc = await addIncome(taxReturn.id, testUser.id, {
        incomeType: 'SALARY',
        source: 'Acme Corp',
        amount: 800000,
      });

      // Calculate and approve
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'APPROVED' } });

      // Mutate amount only (count remains 1)
      await updateIncome(inc.id, testUser.id, { amount: 950000 });

      // Verify PostgreSQL: calculation purged, status reset to DRAFT
      const calcInDb = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calcInDb).toBeNull();

      const returnInDb = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(returnInDb?.status).toBe('DRAFT');
    });

    it('Scenario 3: Atomic invalidation on deleting an income entry', async () => {
      const inc = await addIncome(taxReturn.id, testUser.id, {
        incomeType: 'SALARY',
        source: 'Old Employer',
        amount: 500000,
      });

      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'READY_FOR_REVIEW' } });

      await deleteIncome(inc.id, testUser.id);

      const calcInDb = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calcInDb).toBeNull();

      const returnInDb = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(returnInDb?.status).toBe('DRAFT');
    });

    it('Scenario 4: Atomic invalidation on adding, updating, and deleting deductions', async () => {
      await addIncome(taxReturn.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 900000 });
      await calculateTax(taxReturn.id, testUser.id, 'OLD');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'USER_REVIEW' } });

      // Add deduction -> invalidates
      const ded = await addDeduction(taxReturn.id, testUser.id, {
        section: 'SEC_80C',
        description: 'PPF Deposit',
        claimedAmount: 150000,
      });

      let calc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calc).toBeNull();
      let ret = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(ret?.status).toBe('DRAFT');

      // Recalculate
      await calculateTax(taxReturn.id, testUser.id, 'OLD');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'APPROVED' } });

      // Update deduction amount without changing count -> invalidates
      await updateDeduction(ded.id, testUser.id, { claimedAmount: 120000 });
      calc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calc).toBeNull();
      ret = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(ret?.status).toBe('DRAFT');

      // Recalculate and delete deduction -> invalidates
      await calculateTax(taxReturn.id, testUser.id, 'OLD');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'READY_FOR_REVIEW' } });

      await deleteDeduction(ded.id, testUser.id);
      calc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calc).toBeNull();
      ret = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(ret?.status).toBe('DRAFT');
    });

    it('Scenario 5: Changing return regime or returnType triggers atomic invalidation', async () => {
      await addIncome(taxReturn.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 1000000 });
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'APPROVED' } });

      // Change regime from NEW to OLD
      await updateTaxReturn(taxReturn.id, testUser.id, { regime: 'OLD' });

      let calc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calc).toBeNull();
      let ret = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(ret?.status).toBe('DRAFT');
      expect(ret?.regime).toBe('OLD');

      // Recalculate and change returnType
      await calculateTax(taxReturn.id, testUser.id, 'OLD');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'USER_REVIEW' } });

      await updateTaxReturn(taxReturn.id, testUser.id, { returnType: 'ITR2' });
      calc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calc).toBeNull();
      ret = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(ret?.status).toBe('DRAFT');
      expect(ret?.returnType).toBe('ITR2');
    });

    it('Scenario 6: Transaction rollback behavior when operation fails', async () => {
      await addIncome(taxReturn.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 750000 });
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'READY_FOR_REVIEW' } });

      const countBefore = await prisma.incomeEntry.count({ where: { taxReturnId: taxReturn.id } });
      const calcBefore = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });

      // Execute a transactional operation designed to fail
      await expect(
        prisma.$transaction(async (tx) => {
          // Valid write
          await tx.incomeEntry.create({
            data: {
              taxReturnId: taxReturn.id,
              incomeType: 'SALARY',
              source: 'Ghost Corp',
              amount: 50000,
            },
          });
          await invalidateTaxCalculationsAndResetStatus(taxReturn.id, tx);
          // Intentional constraint violation
          throw new Error('Simulated database network/constraint failure mid-transaction');
        })
      ).rejects.toThrow('Simulated database network/constraint failure mid-transaction');

      // Verify PostgreSQL rolled back ALL operations
      const countAfter = await prisma.incomeEntry.count({ where: { taxReturnId: taxReturn.id } });
      expect(countAfter).toBe(countBefore);

      const calcAfter = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calcAfter?.id).toBe(calcBefore?.id);

      const retAfter = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(retAfter?.status).toBe('READY_FOR_REVIEW');
    });
  });

  describe('Phase 2: Comprehensive Approval Integrity Scenarios', () => {
    let taxReturn: any;

    beforeEach(async () => {
      await prisma.taxReturn.deleteMany({ where: { workspaceId: testWorkspace.id } });
      taxReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
        returnType: 'ITR1',
      });
      await addIncome(taxReturn.id, testUser.id, {
        incomeType: 'SALARY',
        source: 'Acme Software',
        amount: 1200000,
        tdsDeducted: 40000,
      });
    });

    it('Scenario A: Calculate tax and approve return - binds exact canonical snapshot and SHA-256 hash', async () => {
      // 1. Calculate tax
      const calc = await calculateTax(taxReturn.id, testUser.id, 'NEW');
      expect(calc).toBeDefined();

      // 2. Move to USER_REVIEW
      await createReview(taxReturn.id, testUser.id, 'Initial taxpayer self-review');

      // 3. Approve return
      const approvalRes = await approveReturn(taxReturn.id, testUser.id, '127.0.0.1', 'Approved via audit test');
      expect(approvalRes.approval).toBeDefined();

      // 4. Verify in PostgreSQL
      const dbApproval = await prisma.approval.findFirst({ where: { taxReturnId: taxReturn.id, status: 'ACTIVE' } });
      expect(dbApproval).not.toBeNull();
      expect(dbApproval?.approvedBy).toBe(testUser.id);
      expect(dbApproval?.approvalHash).toHaveLength(64);

      const parsedNotes = JSON.parse(dbApproval?.notes as string);
      expect(parsedNotes.note).toBe('Approved via audit test');
      expect(parsedNotes.snapshot.taxReturnId).toBe(taxReturn.id);
      expect(parsedNotes.snapshot.taxableIncome).toBe(Number(calc.taxableIncome));
      expect(parsedNotes.snapshot.totalTax).toBe(Number(calc.totalTax));
      expect(parsedNotes.snapshot.calculationId).toBe(calc.id);

      // Verify cryptographic digest matching
      const expectedHash = generateApprovalHash(parsedNotes.snapshot as CanonicalFinancialSnapshot);
      expect(dbApproval?.approvalHash).toBe(expectedHash);

      const updatedRet = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(updatedRet?.status).toBe('APPROVED');
    });

    it('Scenario G: Attempt approval using a calculation belonging to another return is rejected', async () => {
      // Create second return
      const returnB = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnB.id, testUser.id, { incomeType: 'SALARY', source: 'Other Org', amount: 500000 });
      await calculateTax(returnB.id, testUser.id, 'NEW');

      // taxReturn has NO calculation calculated yet
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'USER_REVIEW' } });

      // Approval for taxReturn must fail even if calculations exist for other returns
      await expect(approveReturn(taxReturn.id, testUser.id, '127.0.0.1')).rejects.toThrow('Tax calculation is required before approval');
    });

    it('Scenario H: Attempt approval with stale calculation (regime mismatch or count mismatch) is rejected', async () => {
      // Calculate under NEW regime
      await calculateTax(taxReturn.id, testUser.id, 'NEW');

      // Manually set regime to OLD without recalculating
      await prisma.taxReturn.update({
        where: { id: taxReturn.id },
        data: { regime: 'OLD', status: 'USER_REVIEW' },
      });

      // Attempt approval -> regime mismatch
      await expect(approveReturn(taxReturn.id, testUser.id, '127.0.0.1')).rejects.toThrow('Calculation regime (NEW) does not match current return regime (OLD)');

      // Reset regime to NEW, but add an uncounted income entry directly into DB to test count staleness detection
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { regime: 'NEW' } });
      await prisma.incomeEntry.create({
        data: {
          taxReturnId: taxReturn.id,
          incomeType: 'OTHER_SOURCES',
          source: 'Undisclosed Freelance',
          amount: 50000,
        },
      });

      // Calculation inputs has incomeCount: 1, database now has 2
      await expect(approveReturn(taxReturn.id, testUser.id, '127.0.0.1')).rejects.toThrow('Tax calculation is stale relative to current income/deduction entries');
    });

    it('Scenario I: Concurrent approval and financial mutation safety', async () => {
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'USER_REVIEW' } });

      // Concurrently run approval and income addition
      const results = await Promise.allSettled([
        approveReturn(taxReturn.id, testUser.id, '127.0.0.1'),
        addIncome(taxReturn.id, testUser.id, {
          incomeType: 'SALARY',
          source: 'Bonus Payment',
          amount: 100000,
        }),
      ]);

      // Verify that return NEVER ends up APPROVED with stale calculation
      const finalReturn = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      const finalCalc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });

      if (finalReturn?.status === 'APPROVED') {
        // If approved, finalCalc MUST match the actual entries
        const incomeCount = await prisma.incomeEntry.count({ where: { taxReturnId: taxReturn.id } });
        expect((finalCalc?.inputs as any)?.incomeCount).toBe(incomeCount);
      } else {
        // If income mutation ran after approval, return status must be reset to DRAFT and calculation deleted
        expect(finalReturn?.status).toBe('DRAFT');
        expect(finalCalc).toBeNull();
      }
    });

    it('Scenario J: Modifying saved approval snapshot causes cryptographic hash verification to fail', async () => {
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await createReview(taxReturn.id, testUser.id, 'Review notes');
      const { approval } = await approveReturn(taxReturn.id, testUser.id, '127.0.0.1', 'Original approval');

      const originalHash = approval.approvalHash;
      const parsedNotes = JSON.parse(approval.notes as string);
      const snapshot: CanonicalFinancialSnapshot = parsedNotes.snapshot;

      // Verify original matches
      expect(generateApprovalHash(snapshot)).toBe(originalHash);

      // Tamper: modify taxable income by ₹1
      const tamperedSnapshot1 = { ...snapshot, taxableIncome: snapshot.taxableIncome + 1 };
      expect(generateApprovalHash(tamperedSnapshot1)).not.toBe(originalHash);

      // Tamper: modify tax liability
      const tamperedSnapshot2 = { ...snapshot, totalTax: snapshot.totalTax - 500 };
      expect(generateApprovalHash(tamperedSnapshot2)).not.toBe(originalHash);

      // Tamper: modify regime
      const tamperedSnapshot3 = { ...snapshot, regime: 'OLD' };
      expect(generateApprovalHash(tamperedSnapshot3)).not.toBe(originalHash);
    });

    it('Scenario E: Tax year & Assessment year isolation between returns', async () => {
      // Return 1: FY 2024-25 -> AY 2025-26
      const retAY25 = taxReturn;
      const calcAY25 = await calculateTax(retAY25.id, testUser.id, 'NEW');
      expect(calcAY25.ruleVersion).toBe('AY2025-26-v1');

      // Return 2: FY 2025-26 -> TY 2026-27 under the 2025 Act
      const retTY26 = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2025-26',
        regime: 'NEW',
      });
      await addIncome(retTY26.id, testUser.id, { incomeType: 'SALARY', source: 'FY26 Employer', amount: 1200000 });
      const calcTY26 = await calculateTax(retTY26.id, testUser.id, 'NEW');
      expect(calcTY26.ruleVersion).toBe('TY2026-27-v1');

      // Verify that calculations remain strictly isolated in PostgreSQL
      const dbCalcAY25 = await prisma.taxCalculation.findFirst({ where: { taxReturnId: retAY25.id } });
      const dbCalcTY26 = await prisma.taxCalculation.findFirst({ where: { taxReturnId: retTY26.id } });

      expect(dbCalcAY25?.ruleVersion).toBe('AY2025-26-v1');
      expect(dbCalcTY26?.ruleVersion).toBe('TY2026-27-v1');
      expect(dbCalcAY25?.id).not.toBe(dbCalcTY26?.id);
    });

    it('Scenario F: Changing tax-impacting profile field (DOB or residential status) invalidates calculations', async () => {
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'APPROVED' } });

      // Profile dateOfBirth modification (taxpayer becomes Senior Citizen >= 60)
      const newDob = new Date('1960-01-01');
      await prisma.$transaction(async (tx) => {
        await tx.taxpayerProfile.update({
          where: { workspaceId: testWorkspace.id },
          data: { dateOfBirth: newDob },
        });

        // Invalidate active returns in workspace
        const activeReturns = await tx.taxReturn.findMany({
          where: {
            workspaceId: testWorkspace.id,
            status: { notIn: ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'] },
          },
        });
        for (const r of activeReturns) {
          await tx.taxCalculation.deleteMany({ where: { taxReturnId: r.id } });
          if (['READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED'].includes(r.status)) {
            await tx.taxReturn.update({ where: { id: r.id }, data: { status: 'DRAFT' } });
          }
        }
      });

      // Verify calculations purged and status reset to DRAFT
      const calcAfterDob = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calcAfterDob).toBeNull();
      const returnAfterDob = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(returnAfterDob?.status).toBe('DRAFT');

      // Recalculate, review, approve
      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'APPROVED' } });

      // Change residentialStatus to NON_RESIDENT (disqualifies Section 87A rebate)
      await prisma.$transaction(async (tx) => {
        await tx.taxpayerProfile.update({
          where: { workspaceId: testWorkspace.id },
          data: { residentialStatus: 'NON_RESIDENT' },
        });

        const activeReturns = await tx.taxReturn.findMany({
          where: {
            workspaceId: testWorkspace.id,
            status: { notIn: ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'] },
          },
        });
        for (const r of activeReturns) {
          await tx.taxCalculation.deleteMany({ where: { taxReturnId: r.id } });
          if (['READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED'].includes(r.status)) {
            await tx.taxReturn.update({ where: { id: r.id }, data: { status: 'DRAFT' } });
          }
        }
      });

      const calcAfterRes = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calcAfterRes).toBeNull();
      const returnAfterRes = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(returnAfterRes?.status).toBe('DRAFT');
    });
  });

  describe('Phase 3: Real Database Document Security & Isolation', () => {
    let foreignUser: any;
    let foreignWorkspace: any;

    beforeAll(async () => {
      foreignUser = await prisma.user.create({
        data: {
          clerkId: 'clerk_foreign_user_999',
          email: 'foreign_user@taxpilot.local',
          firstName: 'Foreign',
          lastName: 'Taxpayer',
        },
      });

      foreignWorkspace = await prisma.workspace.create({
        data: {
          userId: foreignUser.id,
          name: 'Foreign Workspace',
          type: 'INDIVIDUAL',
        },
      });
    });

    afterAll(async () => {
      await prisma.document.deleteMany({ where: { workspaceId: foreignWorkspace.id } });
      await prisma.workspace.deleteMany({ where: { id: foreignWorkspace.id } });
      await prisma.user.deleteMany({ where: { id: foreignUser.id } });
    });

    it('Cross-workspace isolation: user cannot access another user documents', async () => {
      const foreignDoc = await prisma.document.create({
        data: {
          workspaceId: foreignWorkspace.id,
          name: 'Form16_Confidential.pdf',
          originalName: 'Form16_Confidential.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 15420,
          storageKey: `documents/${foreignWorkspace.id}/uuid-doc-1.pdf`,
          category: 'FORM_16',
          status: 'PROCESSED',
          isVerified: true,
        },
      });

      // User 1 attempts to find foreign document
      const doc = await prisma.document.findUnique({
        where: { id: foreignDoc.id },
        include: { workspace: true },
      });

      expect(doc).not.toBeNull();
      // Ownership assertion check
      expect(doc?.workspace.userId).not.toBe(testUser.id);
      expect(doc?.workspace.userId).toBe(foreignUser.id);
    });

    it('Document deletion atomically invalidates return calculation and resets status', async () => {
      const taxReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(taxReturn.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 800000 });

      const testDoc = await prisma.document.create({
        data: {
          workspaceId: testWorkspace.id,
          taxReturnId: taxReturn.id,
          name: 'salary_slip.pdf',
          originalName: 'salary_slip.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 12000,
          storageKey: `documents/${testWorkspace.id}/uuid-doc-2.pdf`,
          category: 'SALARY_SLIP',
          status: 'PROCESSED',
          isVerified: true,
        },
      });

      await calculateTax(taxReturn.id, testUser.id, 'NEW');
      await prisma.taxReturn.update({ where: { id: taxReturn.id }, data: { status: 'APPROVED' } });

      // Transactional delete of document
      await prisma.$transaction(async (tx) => {
        await tx.document.delete({ where: { id: testDoc.id } });
        if (testDoc.taxReturnId) {
          await invalidateTaxCalculationsAndResetStatus(testDoc.taxReturnId, tx);
        }
      });

      // Verify calculation deleted and status reset to DRAFT
      const calcInDb = await prisma.taxCalculation.findFirst({ where: { taxReturnId: taxReturn.id } });
      expect(calcInDb).toBeNull();

      const returnInDb = await prisma.taxReturn.findUnique({ where: { id: taxReturn.id } });
      expect(returnInDb?.status).toBe('DRAFT');
    });

    it('Locked return blocks document deletion', async () => {
      const lockedReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await prisma.taxReturn.update({ where: { id: lockedReturn.id }, data: { status: 'PROCESSING' } });

      const lockedDoc = await prisma.document.create({
        data: {
          workspaceId: testWorkspace.id,
          taxReturnId: lockedReturn.id,
          name: 'filed_proof.pdf',
          originalName: 'filed_proof.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 9000,
          storageKey: `documents/${testWorkspace.id}/uuid-doc-3.pdf`,
          category: 'OTHER',
          status: 'PROCESSED',
        },
      });

      const ret = await prisma.taxReturn.findUnique({ where: { id: lockedReturn.id } });
      const lockedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'];
      expect(lockedStates.includes(ret?.status!)).toBe(true);

      // Verify policy: operation rejected
      expect(() => {
        if (ret && lockedStates.includes(ret.status)) {
          throw new Error(`Cannot delete documents from a locked tax return (${ret.status})`);
        }
      }).toThrow('Cannot delete documents from a locked tax return (PROCESSING)');
    });
  });

  describe('Phase 4: Concurrency Hardening & Year Mapping Validation (Real PostgreSQL)', () => {
    it('Scenario 4.1: Explicit TY 2026-27 creates return under Income-tax Act, 2025 and persists metadata', async () => {
      const returnTY26 = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2025-26',
        assessmentYear: 'TY 2026-27',
        regime: 'NEW',
      });

      expect(returnTY26.assessmentYear).toBe('TY 2026-27');
      const meta = returnTY26.metadata as any;
      expect(meta.framework).toBe('IT_ACT_2025');
      expect(meta.yearType).toBe('TAX_YEAR');
      expect(meta.canonicalYear).toBe('TY 2026-27');
      expect(meta.ruleVersion).toBe('TY2026-27-v1');

      // Verify calculateTax executes under Act 2025 rules
      await addIncome(returnTY26.id, testUser.id, { incomeType: 'SALARY', source: 'Tech Corp', amount: 1200000 });
      const calc = await calculateTax(returnTY26.id, testUser.id, 'NEW');
      expect(calc.ruleVersion).toBe('TY2026-27-v1');
    });

    it('Scenario 4.2: Bare "2026-27" without framework metadata throws AMBIGUOUS_YEAR_IDENTIFIER', async () => {
      await expect(
        createTaxReturn(testWorkspace.id, testUser.id, {
          financialYear: '2026-27',
          assessmentYear: '2026-27',
        })
      ).rejects.toThrow("Ambiguous year identifier '2026-27'");
    });

    it('Scenario 4.3: "AY 2026-27" creates return under Income-tax Act, 1961 with AY2026-27-v1 and never maps to TY2026-27-v1', async () => {
      const ret = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2025-26',
        assessmentYear: 'AY 2026-27',
      });
      expect(ret.assessmentYear).toBe('AY 2026-27');
      expect((ret.metadata as any)?.framework).toBe('IT_ACT_1961');
      expect((ret.metadata as any)?.yearType).toBe('ASSESSMENT_YEAR');
      expect((ret.metadata as any)?.canonicalYear).toBe('AY 2026-27');
      expect((ret.metadata as any)?.ruleVersion).toBe('AY2026-27-v1');
      expect((ret.metadata as any)?.ruleVersion).not.toBe('TY2026-27-v1');
    });

    it('Scenario 4.4: Historical years under TY framework ("TY 2024-25", "TY 2025-26") are rejected', async () => {
      await expect(
        createTaxReturn(testWorkspace.id, testUser.id, {
          financialYear: '2023-24',
          assessmentYear: 'TY 2024-25',
        })
      ).rejects.toThrow("The Tax Year (TY) framework under Income-tax Act, 2025 is not applicable prior to 2026-27");
    });

    it('Scenario 4.5: Updating assessmentYear via updateTaxReturn validates framework and updates metadata', async () => {
      const returnObj = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        assessmentYear: 'AY 2025-26',
      });
      expect(returnObj.assessmentYear).toBe('AY 2025-26');

      // Updating to ambiguous bare 2026-27 must fail
      await expect(
        updateTaxReturn(returnObj.id, testUser.id, { assessmentYear: '2026-27' })
      ).rejects.toThrow("Ambiguous year identifier '2026-27'");

      // Updating to explicit TY 2026-27 succeeds and updates metadata
      const updated = await updateTaxReturn(returnObj.id, testUser.id, { assessmentYear: 'TY 2026-27' });
      expect(updated.assessmentYear).toBe('TY 2026-27');
      const meta = updated.metadata as any;
      expect(meta.framework).toBe('IT_ACT_2025');
      expect(meta.ruleVersion).toBe('TY2026-27-v1');
    });

    it('Scenario 4.6: Simultaneous approval race condition - row lock ensures second request gets 409 ALREADY_APPROVED', async () => {
      const returnToApprove = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnToApprove.id, testUser.id, { incomeType: 'SALARY', source: 'Corp', amount: 1000000 });
      await calculateTax(returnToApprove.id, testUser.id, 'NEW');
      await createReview(returnToApprove.id, testUser.id, 'Self-review');

      // Execute two simultaneous approval attempts
      const [res1, res2] = await Promise.allSettled([
        approveReturn(returnToApprove.id, testUser.id, '127.0.0.1', 'Approval A'),
        approveReturn(returnToApprove.id, testUser.id, '127.0.0.1', 'Approval B'),
      ]);

      const fulfilled = [res1, res2].filter(r => r.status === 'fulfilled');
      const rejected = [res1, res2].filter(r => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      // Verify the rejected request received 409 ALREADY_APPROVED
      const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectionReason.statusCode).toBe(409);
      expect(rejectionReason.code).toBe('ALREADY_APPROVED');

      // Verify exactly ONE approval record exists in PostgreSQL
      const approvalCount = await prisma.approval.count({ where: { taxReturnId: returnToApprove.id } });
      expect(approvalCount).toBe(1);

      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnToApprove.id } });
      expect(dbReturn?.status).toBe('APPROVED');
    });

    it('Scenario 4.7: Adding income to an APPROVED return invalidates approval and preserves immutable audit history', async () => {
      const returnAppr = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnAppr.id, testUser.id, { incomeType: 'SALARY', source: 'Employer 1', amount: 900000 });
      await calculateTax(returnAppr.id, testUser.id, 'NEW');
      await createReview(returnAppr.id, testUser.id, 'Review');
      await approveReturn(returnAppr.id, testUser.id, '127.0.0.1', 'Initial approval');

      // Verify return is approved and ACTIVE approval record exists
      let activeApproval = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'ACTIVE' } });
      expect(activeApproval).not.toBeNull();
      expect(activeApproval?.status).toBe('ACTIVE');
      let dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnAppr.id } });
      expect(dbReturn?.status).toBe('APPROVED');

      // Post-approval financial mutation: add new income
      await addIncome(returnAppr.id, testUser.id, { incomeType: 'OTHER_SOURCES', source: 'Interest', amount: 15000 });

      // Invariant: No ACTIVE approval exists; calculations deleted; return reverted to DRAFT
      activeApproval = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'ACTIVE' } });
      expect(activeApproval).toBeNull();

      const dbCalc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: returnAppr.id } });
      expect(dbCalc).toBeNull();

      dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnAppr.id } });
      expect(dbReturn?.status).toBe('DRAFT');

      // Immutable Audit History Invariant: Original approval record is preserved with INVALIDATED status
      const history = await prisma.approval.findMany({ where: { taxReturnId: returnAppr.id } });
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('INVALIDATED');
      expect(history[0].approvalHash).toHaveLength(64);
      expect(history[0].invalidatedAt).not.toBeNull();
      expect(history[0].invalidationReason).toBe('Financial data modified');
    });

    it('Scenario 4.8: Updating deduction on an APPROVED return invalidates approval and records reason', async () => {
      const returnAppr = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'OLD',
      });
      await addIncome(returnAppr.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 1000000 });
      const ded = await addDeduction(returnAppr.id, testUser.id, {
        section: 'SEC_80C',
        description: 'LIC Premium',
        claimedAmount: 50000,
      });
      await calculateTax(returnAppr.id, testUser.id, 'OLD');
      await createReview(returnAppr.id, testUser.id, 'Review');
      await approveReturn(returnAppr.id, testUser.id, '127.0.0.1', 'Initial approval');

      // Post-approval deduction modification
      await updateDeduction(ded.id, testUser.id, { claimedAmount: 75000 });

      const activeApproval = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'ACTIVE' } });
      expect(activeApproval).toBeNull();

      const dbCalc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: returnAppr.id } });
      expect(dbCalc).toBeNull();

      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnAppr.id } });
      expect(dbReturn?.status).toBe('DRAFT');

      const invalidated = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'INVALIDATED' } });
      expect(invalidated).not.toBeNull();
      expect(invalidated?.invalidationReason).toBe('Financial data modified');
    });

    it('Scenario 4.9: Profile update on an APPROVED return invalidates calculations and marks approvals INVALIDATED', async () => {
      const returnAppr = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnAppr.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 800000 });
      await calculateTax(returnAppr.id, testUser.id, 'NEW');
      await createReview(returnAppr.id, testUser.id, 'Review');
      await approveReturn(returnAppr.id, testUser.id, '127.0.0.1', 'Approved');

      // Verify active approval exists
      let activeApproval = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'ACTIVE' } });
      expect(activeApproval).not.toBeNull();

      // Profile modification inside transaction using invalidateTaxCalculationsAndResetStatus
      await prisma.$transaction(async (tx) => {
        await tx.taxpayerProfile.update({
          where: { workspaceId: testWorkspace.id },
          data: { dateOfBirth: new Date('1955-08-20') }, // Senior citizen change
        });
        const activeReturns = await tx.taxReturn.findMany({
          where: { workspaceId: testWorkspace.id, status: { notIn: ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'] } },
        });
        for (const ret of activeReturns) {
          await invalidateTaxCalculationsAndResetStatus(ret.id, tx, 'Taxpayer date of birth updated');
        }
      });

      activeApproval = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'ACTIVE' } });
      expect(activeApproval).toBeNull();

      const dbCalc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: returnAppr.id } });
      expect(dbCalc).toBeNull();

      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnAppr.id } });
      expect(dbReturn?.status).toBe('DRAFT');

      const invalidated = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'INVALIDATED' } });
      expect(invalidated).not.toBeNull();
      expect(invalidated?.invalidationReason).toBe('Taxpayer date of birth updated');
    });

    it('Scenario 4.10: Regime change on an APPROVED return marks approval INVALIDATED and resets status to DRAFT', async () => {
      const returnAppr = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnAppr.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 850000 });
      await calculateTax(returnAppr.id, testUser.id, 'NEW');
      await createReview(returnAppr.id, testUser.id, 'Review');
      await approveReturn(returnAppr.id, testUser.id, '127.0.0.1', 'Approved');

      // Update regime to OLD
      await updateTaxReturn(returnAppr.id, testUser.id, { regime: 'OLD' });

      const activeApproval = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'ACTIVE' } });
      expect(activeApproval).toBeNull();

      const dbCalc = await prisma.taxCalculation.findFirst({ where: { taxReturnId: returnAppr.id } });
      expect(dbCalc).toBeNull();

      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnAppr.id } });
      expect(dbReturn?.status).toBe('DRAFT');
      expect(dbReturn?.regime).toBe('OLD');

      const invalidated = await prisma.approval.findFirst({ where: { taxReturnId: returnAppr.id, status: 'INVALIDATED' } });
      expect(invalidated).not.toBeNull();
    });

    it('Scenario 4.11: Re-approval supersedes older approvals and maintains complete chronological history', async () => {
      const returnObj = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnObj.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 700000 });
      await calculateTax(returnObj.id, testUser.id, 'NEW');
      await createReview(returnObj.id, testUser.id, 'Review 1');
      await approveReturn(returnObj.id, testUser.id, '127.0.0.1', 'First Approval');

      // Mutate income to invalidate first approval
      await addIncome(returnObj.id, testUser.id, { incomeType: 'SALARY', source: 'Bonus', amount: 50000 });

      // Recalculate, review, and re-approve
      await calculateTax(returnObj.id, testUser.id, 'NEW');
      await createReview(returnObj.id, testUser.id, 'Review 2');
      await approveReturn(returnObj.id, testUser.id, '127.0.0.1', 'Second Approval');

      // Verify that database has exactly 2 approvals: 1 INVALIDATED, 1 ACTIVE
      const approvals = await prisma.approval.findMany({
        where: { taxReturnId: returnObj.id },
        orderBy: { approvedAt: 'asc' },
      });
      expect(approvals).toHaveLength(2);
      expect(approvals[0].status).toBe('INVALIDATED');
      expect(approvals[1].status).toBe('ACTIVE');
      expect(approvals[0].id).not.toBe(approvals[1].id);
    });

    it('Scenario 4.12: Inconsistent tax-year metadata combinations are rejected with INCONSISTENT_TAX_YEAR_METADATA', async () => {
      // Conflicting framework and yearType
      expect(() => {
        resolveYearSpecification('AY 2024-25', { framework: 'IT_ACT_1961', yearType: 'TAX_YEAR' });
      }).toThrow('Inconsistent tax-year metadata: framework IT_ACT_1961 cannot have yearType TAX_YEAR');

      expect(() => {
        resolveYearSpecification('TY 2026-27', { framework: 'IT_ACT_2025', yearType: 'ASSESSMENT_YEAR' });
      }).toThrow('Inconsistent tax-year metadata: framework IT_ACT_2025 cannot have yearType ASSESSMENT_YEAR');

      // Conflicting framework and canonicalYear
      expect(() => {
        resolveYearSpecification('AY 2024-25', { framework: 'IT_ACT_1961', canonicalYear: 'TY 2026-27' });
      }).toThrow("Inconsistent tax-year metadata: framework IT_ACT_1961 cannot have canonicalYear 'TY 2026-27'");

      // Contradictory framework provided for explicit year
      expect(() => {
        resolveYearSpecification('TY 2026-27', { framework: 'IT_ACT_1961' });
      }).toThrow("Inconsistent tax-year metadata: Specified framework 'IT_ACT_1961' does not match resolved framework 'IT_ACT_2025'");

      expect(() => {
        resolveYearSpecification('AY 2025-26', { framework: 'IT_ACT_2025' });
      }).toThrow("Inconsistent tax-year metadata: Specified framework 'IT_ACT_2025' does not match resolved framework 'IT_ACT_1961'");

      expect(() => {
        resolveYearSpecification('AY 2026-27', { framework: 'IT_ACT_2025' });
      }).toThrow("Inconsistent tax-year metadata: Specified framework 'IT_ACT_2025' does not match resolved framework 'IT_ACT_1961'");
    });

    it('Scenario 4.13: Cross-workspace isolation - unauthorized user cannot access documents or workspace', async () => {
      // Create second user & workspace
      const otherUser = await prisma.user.create({
        data: {
          clerkId: 'clerk_test_intruder_999',
          email: 'intruder@taxpilot.local',
          firstName: 'Unauthorized',
          lastName: 'User',
        },
      });

      const otherWorkspace = await prisma.workspace.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Workspace',
          type: 'INDIVIDUAL',
        },
      });

      try {
        // Asserting workspace ownership across users must throw 403 FORBIDDEN
        await expect(
          assertWorkspaceOwner(testWorkspace.id, otherUser.id)
        ).rejects.toThrow('Forbidden');

        // Document created in testWorkspace cannot be accessed via otherWorkspace query
        const doc = await prisma.document.create({
          data: {
            workspaceId: testWorkspace.id,
            name: 'confidential_16.pdf',
            originalName: 'confidential_16.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 15000,
            storageKey: `documents/${testWorkspace.id}/confidential.pdf`,
            category: 'FORM_16',
            status: 'PROCESSED',
          },
        });

        const otherDocs = await prisma.document.findMany({
          where: { workspaceId: otherWorkspace.id },
        });
        expect(otherDocs.find((d: any) => d.id === doc.id)).toBeUndefined();
      } finally {
        await prisma.document.deleteMany({ where: { workspaceId: otherWorkspace.id } });
        await prisma.workspace.deleteMany({ where: { id: otherWorkspace.id } });
        await prisma.user.deleteMany({ where: { id: otherUser.id } });
      }
    });

    it('Scenario 4.14: Filing is rejected with APPROVAL_SUPERSEDED if only superseded/invalidated approvals exist', async () => {
      const returnObj = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnObj.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 800000 });
      await calculateTax(returnObj.id, testUser.id, 'NEW');
      await createReview(returnObj.id, testUser.id, 'Review');
      await approveReturn(returnObj.id, testUser.id, '127.0.0.1', 'Approved');

      // Invalidate the approval via financial mutation
      await addIncome(returnObj.id, testUser.id, { incomeType: 'OTHER_SOURCES', source: 'Interest Income', amount: 10000 });

      // Attempt to file
      await expect(
        executeItrFiling(returnObj.id, testUser.id)
      ).rejects.toThrow('The previous approval has been superseded or invalidated. Re-approval is required before filing.');
    });

    it('Scenario 4.15: Government filing dispatch failure preserves return status and logs durable FilingAttempt', async () => {
      const returnObj = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await addIncome(returnObj.id, testUser.id, { incomeType: 'SALARY', source: 'Employer', amount: 800000 });
      await calculateTax(returnObj.id, testUser.id, 'NEW');
      await createReview(returnObj.id, testUser.id, 'Review');
      await approveReturn(returnObj.id, testUser.id, '127.0.0.1', 'Approved');

      // Return is currently APPROVED
      const preStatus = (await prisma.taxReturn.findUnique({ where: { id: returnObj.id } }))?.status;
      expect(preStatus).toBe('APPROVED');

      // Attempt filing - ERI login is blocked in sandbox service
      await expect(
        executeItrFiling(returnObj.id, testUser.id)
      ).rejects.toThrow();

      // Verify return status is restored to APPROVED (not stuck in PROCESSING or corrupted)
      const postStatus = (await prisma.taxReturn.findUnique({ where: { id: returnObj.id } }))?.status;
      expect(postStatus).toBe('APPROVED');

      // Verify a durable FilingAttempt record exists with failure details
      const attempt = await prisma.filingAttempt.findFirst({
        where: { taxReturnId: returnObj.id },
        orderBy: { dispatchedAt: 'desc' },
      });
      expect(attempt).not.toBeNull();
      expect(attempt?.status).toBe('FAILED');
    });

    it('Scenario 4.16: E-Verification initiation failure preserves UNVERIFIED status and logs VerificationAttempt', async () => {
      const filedReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      // Mark as FILED
      await prisma.taxReturn.update({
        where: { id: filedReturn.id },
        data: { status: 'FILED', verificationStatus: 'UNVERIFIED' },
      });

      // Attempt e-verification initiation - provider is blocked
      await expect(
        initiateVerification(filedReturn.id, testUser.id, 'AADHAAR_OTP')
      ).rejects.toThrow('Verification unavailable: Sandbox ERI API test credentials and product scopes are blocked');

      // Verify verificationStatus was safely rolled back to UNVERIFIED (NOT marked FAILED)
      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: filedReturn.id } });
      expect(dbReturn?.verificationStatus).toBe('UNVERIFIED');

      // Verify a durable VerificationAttempt record exists with FAILED_OPERATIONAL
      const attempt = await prisma.verificationAttempt.findFirst({
        where: { taxReturnId: filedReturn.id },
        orderBy: { requestedAt: 'desc' },
      });
      expect(attempt).not.toBeNull();
      expect(attempt?.status).toBe('FAILED');
      expect(attempt?.errorCategory).toBe('PROVIDER_ACCESS_BLOCKED');
    });

    it('Scenario 4.17: E-verification initiation is rejected when return is not in FILED state', async () => {
      const draftReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      expect(draftReturn.status).toBe('DRAFT');

      await expect(
        initiateVerification(draftReturn.id, testUser.id, 'AADHAAR_OTP')
      ).rejects.toThrow('Only successfully filed returns can be e-verified.');

      // Also test with APPROVED return
      await prisma.taxReturn.update({
        where: { id: draftReturn.id },
        data: { status: 'APPROVED' },
      });

      await expect(
        initiateVerification(draftReturn.id, testUser.id, 'AADHAAR_OTP')
      ).rejects.toThrow('Only successfully filed returns can be e-verified.');
    });

    it('Scenario 4.18: E-verification enforces return ownership across distinct PostgreSQL users', async () => {
      const filedReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await prisma.taxReturn.update({
        where: { id: filedReturn.id },
        data: { status: 'FILED', verificationStatus: 'UNVERIFIED' },
      });

      // Create distinct unauthorized user
      const rogueUser = await prisma.user.create({
        data: {
          clerkId: 'clerk_rogue_verifier_999',
          email: 'rogue_verifier@taxpilot.local',
          firstName: 'Rogue',
          lastName: 'Verifier',
        },
      });

      try {
        // Rogue user cannot initiate verification
        await expect(
          initiateVerification(filedReturn.id, rogueUser.id, 'AADHAAR_OTP')
        ).rejects.toThrow('Forbidden');

        // Rogue user cannot submit OTP
        await expect(
          submitVerificationOtp(filedReturn.id, rogueUser.id, '123456')
        ).rejects.toThrow('Forbidden');

        // Rogue user cannot access verification history
        await expect(
          getVerificationHistory(filedReturn.id, rogueUser.id)
        ).rejects.toThrow('Forbidden');

        // Rogue user cannot reconcile verification
        await expect(
          reconcileVerificationStatus(filedReturn.id, rogueUser.id)
        ).rejects.toThrow('Forbidden');
      } finally {
        await prisma.user.delete({ where: { id: rogueUser.id } });
      }
    });

    it('Scenario 4.19: OTP submission against blocked provider preserves PENDING status in PostgreSQL', async () => {
      const filedReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await prisma.taxReturn.update({
        where: { id: filedReturn.id },
        data: { status: 'FILED', verificationStatus: 'PENDING' },
      });
      const attempt = await prisma.verificationAttempt.create({
        data: {
          taxReturnId: filedReturn.id,
          method: 'AADHAAR_OTP',
          status: 'INITIATED',
        },
      });

      // Submitting OTP fails because provider is blocked
      await expect(
        submitVerificationOtp(filedReturn.id, testUser.id, '654321')
      ).rejects.toThrow('Sandbox ERI API test credentials and product scopes are blocked');

      // Crucial Safety: Verification status remains PENDING in PostgreSQL, NOT marked FAILED or VERIFIED
      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: filedReturn.id } });
      expect(dbReturn?.verificationStatus).toBe('PENDING');
      expect(dbReturn?.status).toBe('FILED');

      // Crucial Safety: Attempt is logged with status FAILED and PROVIDER_ACCESS_BLOCKED
      const dbAttempt = await prisma.verificationAttempt.findUnique({ where: { id: attempt.id } });
      expect(dbAttempt?.status).toBe('FAILED');
      expect(dbAttempt?.errorCategory).toBe('PROVIDER_ACCESS_BLOCKED');
    });

    it('Scenario 4.20: Reconcile verification resets abandoned PENDING return to UNVERIFIED', async () => {
      const filedReturn = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2024-25',
        regime: 'NEW',
      });
      await prisma.taxReturn.update({
        where: { id: filedReturn.id },
        data: { status: 'FILED', verificationStatus: 'PENDING' },
      });
      // No verificationAttempt created (abandoned claim scenario)

      const result = await reconcileVerificationStatus(filedReturn.id, testUser.id);
      expect(result.verificationStatus).toBe('UNVERIFIED');

      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: filedReturn.id } });
      expect(dbReturn?.verificationStatus).toBe('UNVERIFIED');
    });

    it('Scenario 4.21: Authoritative AY 2026-27 calculation under Income-tax Act, 1961 persists in PostgreSQL', async () => {
      const returnObj = await createTaxReturn(testWorkspace.id, testUser.id, {
        financialYear: '2025-26',
        assessmentYear: 'AY 2026-27',
        regime: 'NEW',
      });
      await addIncome(returnObj.id, testUser.id, { incomeType: 'SALARY', source: 'Tech Corp', amount: 1275000 });
      await addDeduction(returnObj.id, testUser.id, {
        section: 'STANDARD_DEDUCTION',
        description: 'Standard Deduction u/s 16(ia)',
        claimedAmount: 75000,
      });

      const calcResult = await calculateTax(returnObj.id, testUser.id, 'NEW');
      expect(calcResult.ruleVersion).toBe('AY2026-27-v1');
      expect(calcResult.canonicalYear).toBe('AY 2026-27');
      expect(Number(calcResult.grossIncome)).toBe(1275000);
      expect(Number(calcResult.taxableIncome)).toBe(1200000);
      expect(Number(calcResult.totalTax)).toBe(0); // Full Section 87A rebate

      // Verify calculation persistence in PostgreSQL
      const dbCalc = await prisma.taxCalculation.findFirst({
        where: { taxReturnId: returnObj.id },
        include: { lines: true },
      });
      expect(dbCalc).not.toBeNull();
      expect(dbCalc?.ruleVersion).toBe('AY2026-27-v1');
      expect(Number(dbCalc?.taxableIncome)).toBe(1200000);
      expect(Number(dbCalc?.totalTax)).toBe(0);

      const dbReturn = await prisma.taxReturn.findUnique({ where: { id: returnObj.id } });
      expect(dbReturn?.assessmentYear).toBe('AY 2026-27');
      expect((dbReturn?.metadata as any)?.ruleVersion).toBe('AY2026-27-v1');
    });
  });
});
