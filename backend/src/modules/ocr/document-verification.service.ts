import prisma from '../../config/prisma';
import { invalidateTaxCalculationsAndResetStatus } from '../../services/taxReturn.service';
import { AppError } from '../../utils/response';
import { DeductionSection } from '@prisma/client';

export class DocumentVerificationService {
  /**
   * Approves and verifies extracted document fields, syncing verified financial figures
   * into IncomeEntry and Deduction models with full source tracing and deduplication.
   */
  public static async verifyAndApplyToTaxReturn(
    documentId: string,
    userId: string,
    fieldOverrides?: Record<string, any>
  ) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        workspace: true,
        extractedFields: true,
      },
    });

    if (!doc) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }
    if (doc.workspace.userId !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // Find or create active tax return
    let taxReturnId = doc.taxReturnId;
    if (!taxReturnId) {
      const activeReturn = await prisma.taxReturn.findFirst({
        where: { workspaceId: doc.workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      if (activeReturn) {
        taxReturnId = activeReturn.id;
      } else {
        // Create a default draft return for current assessment year
        const newReturn = await prisma.taxReturn.create({
          data: {
            workspaceId: doc.workspaceId,
            financialYear: '2025-26',
            assessmentYear: '2026-27',
            status: 'DRAFT',
            regime: 'NEW',
          },
        });
        taxReturnId = newReturn.id;
      }

      await prisma.document.update({
        where: { id: documentId },
        data: { taxReturnId },
      });
    }

    // Check return locked status
    const targetReturn = await prisma.taxReturn.findUnique({ where: { id: taxReturnId } });
    if (targetReturn && ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'].includes(targetReturn.status)) {
      throw new AppError(`Cannot verify document into locked return (${targetReturn.status})`, 403, 'LOCKED_RETURN');
    }

    // Apply any explicit user corrections from fieldOverrides
    if (fieldOverrides && Object.keys(fieldOverrides).length > 0) {
      for (const [fName, newVal] of Object.entries(fieldOverrides)) {
        await prisma.extractedField.updateMany({
          where: { documentId, fieldName: fName },
          data: {
            normalizedValue: String(newVal),
            sourceInfo: {
              userCorrected: true,
              originalValue: doc.extractedFields.find(f => f.fieldName === fName)?.rawValue,
            },
          },
        });
      }
    }

    // Reload refreshed fields
    const updatedFields = await prisma.extractedField.findMany({ where: { documentId } });
    const getVal = (name: string): any => {
      const f = updatedFields.find(x => x.fieldName === name);
      if (!f || f.normalizedValue == null) return null;
      const num = parseFloat(f.normalizedValue);
      return isNaN(num) ? f.normalizedValue : num;
    };

    // Execute atomic sync
    const result = await prisma.$transaction(async (tx) => {
      // 1. Remove existing entries previously imported from THIS document to prevent duplicates
      await tx.incomeEntry.deleteMany({ where: { sourceDocumentId: documentId } });
      await tx.deduction.deleteMany({ where: { sourceDocumentId: documentId } });

      const importedItems: { incomeEntries: string[]; deductions: string[] } = {
        incomeEntries: [],
        deductions: [],
      };

      // 2. Map based on document category
      if (doc.category === 'FORM_16' || doc.category === 'SALARY_SLIP') {
        const gross = getVal('grossSalary') || getVal('grossEarnings');
        const employer = getVal('employerName') || 'Salaried Employer';
        const tds = getVal('tdsDeducted') || 0;
        const employeePan = getVal('employeePan');
        const employerTan = getVal('employerTan');

        if (typeof gross === 'number' && gross > 0) {
          const inc = await tx.incomeEntry.create({
            data: {
              taxReturnId: taxReturnId!,
              incomeType: 'SALARY',
              source: employer,
              amount: gross,
              tdsDeducted: typeof tds === 'number' ? tds : 0,
              sourceDocumentId: documentId,
              notes: `Auto-imported from verified ${doc.category === 'FORM_16' ? 'Form 16' : 'Salary Slip'} (Employer TAN: ${employerTan || 'N/A'})`,
              metadata: {
                pan: employeePan,
                tan: employerTan,
                standardDeduction: getVal('standardDeduction'),
                professionalTax: getVal('professionalTax'),
                exemptAllowances: getVal('exemptAllowances'),
              },
            },
          });
          importedItems.incomeEntries.push(inc.id);
        }

        // Deductions Chapter VI-A from Form 16 / Salary Slip
        const d80c = getVal('deductions80C') || getVal('providentFund');
        if (typeof d80c === 'number' && d80c > 0) {
          const ded = await tx.deduction.create({
            data: {
              taxReturnId: taxReturnId!,
              section: DeductionSection.SEC_80C,
              description: `Provident Fund, Life Insurance & ELSS (from ${doc.name})`,
              claimedAmount: d80c,
              eligibleAmount: Math.min(150000, d80c),
              sourceDocumentId: documentId,
            },
          });
          importedItems.deductions.push(ded.id);
        }

        const d80ccd1b = getVal('deductions80CCD1B');
        if (typeof d80ccd1b === 'number' && d80ccd1b > 0) {
          const ded = await tx.deduction.create({
            data: {
              taxReturnId: taxReturnId!,
              section: DeductionSection.SEC_80CCD1B,
              description: `NPS Tier I contribution (from ${doc.name})`,
              claimedAmount: d80ccd1b,
              eligibleAmount: Math.min(50000, d80ccd1b),
              sourceDocumentId: documentId,
            },
          });
          importedItems.deductions.push(ded.id);
        }

        const d80d = getVal('deductions80D');
        if (typeof d80d === 'number' && d80d > 0) {
          const ded = await tx.deduction.create({
            data: {
              taxReturnId: taxReturnId!,
              section: DeductionSection.SEC_80D,
              description: `Health Insurance Premium (from ${doc.name})`,
              claimedAmount: d80d,
              eligibleAmount: Math.min(25000, d80d),
              sourceDocumentId: documentId,
            },
          });
          importedItems.deductions.push(ded.id);
        }
      } else if (doc.category === 'INVESTMENT_PROOF' || doc.category === 'INSURANCE_PREMIUM') {
        const amt = getVal('amount');
        const inst = getVal('institutionName') || 'Investment';
        const rawSec = getVal('deductionSection') || 'SEC_80C';
        const sectionEnum = (Object.values(DeductionSection).includes(rawSec) ? rawSec : DeductionSection.SEC_80C) as DeductionSection;

        if (typeof amt === 'number' && amt > 0) {
          const ded = await tx.deduction.create({
            data: {
              taxReturnId: taxReturnId!,
              section: sectionEnum,
              description: `${inst} verified proof`,
              claimedAmount: amt,
              eligibleAmount: amt,
              sourceDocumentId: documentId,
            },
          });
          importedItems.deductions.push(ded.id);
        }
      }

      // 3. Mark fields as verified
      await tx.extractedField.updateMany({
        where: { documentId },
        data: { isVerified: true },
      });

      // 4. Mark Document as VERIFIED
      const updatedDoc = await tx.document.update({
        where: { id: documentId },
        data: {
          status: 'VERIFIED',
          isVerified: true,
        },
      });

      // 5. Invalidate tax calculations so deterministic engine updates net liability
      await invalidateTaxCalculationsAndResetStatus(taxReturnId!, tx, `Document ${doc.name} verified`);

      return {
        document: updatedDoc,
        importedItems,
        taxReturnId,
      };
    });

    return result;
  }
}

