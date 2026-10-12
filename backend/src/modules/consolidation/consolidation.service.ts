import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { IncomeEntry, Document, ExtractedField } from '@prisma/client';

export const consolidateIncome = async (taxReturnId: string, userId: string) => {
  // 1. Fetch all manually entered or pre-existing income entries
  const existingEntries = await prisma.incomeEntry.findMany({
    where: { taxReturnId }
  });

  // 2. Fetch all verified documents and their extracted fields for this tax return
  const documents = await prisma.document.findMany({
    where: { taxReturnId, isVerified: true },
    include: { extractedFields: { where: { isVerified: true } } }
  });

  const consolidated: any[] = [];
  const processedSignatures = new Set<string>();

  // Process existing entries (manual or previously added)
  for (const entry of existingEntries) {
    const sig = `${entry.incomeType}-${entry.amount.toString()}`;
    if (!processedSignatures.has(sig)) {
      processedSignatures.add(sig);
      consolidated.push({
        id: entry.id,
        type: entry.incomeType,
        incomeType: entry.incomeType,
        source: entry.source,
        amount: Number(entry.amount),
        tds: Number(entry.tdsDeducted || 0),
        isManual: !entry.sourceDocumentId,
        sourceDocumentId: entry.sourceDocumentId
      });
    }
  }

  // Process extracted fields from documents to discover new income
  // For simplicity, assuming fieldNames like 'SALARY_INCOME', 'TDS_DEDUCTED'
  for (const doc of documents) {
    let incomeAmount = 0;
    let tdsAmount = 0;
    let incomeType = 'OTHER_SOURCES';

    for (const field of doc.extractedFields) {
      if (field.fieldName === 'SALARY_INCOME') {
        incomeAmount = Number(field.normalizedValue || field.rawValue);
        incomeType = 'SALARY';
      }
      if (field.fieldName === 'INTEREST_INCOME') {
        incomeAmount = Number(field.normalizedValue || field.rawValue);
        incomeType = 'OTHER_SOURCES';
      }
      if (field.fieldName === 'TDS_DEDUCTED') {
        tdsAmount = Number(field.normalizedValue || field.rawValue);
      }
    }

    if (incomeAmount > 0) {
      const sig = `${incomeType}-${incomeAmount}`;
      // Basic deduplication: if we already have an income of the exact same type and amount, skip it
      if (!processedSignatures.has(sig)) {
        processedSignatures.add(sig);
        consolidated.push({
          id: `extracted-${doc.id}`, // virtual ID
          type: incomeType,
          incomeType,
          source: `Extracted from ${doc.name}`,
          amount: incomeAmount,
          tds: tdsAmount,
          isManual: false,
          sourceDocumentId: doc.id
        });
      }
    }
  }

  return consolidated;
};
