import prisma from '../../config/prisma';
import { PdfExtractor } from './engines/pdf-extractor';
import { PdfRasterizer } from './engines/pdf-rasterizer';
import { TesseractEngine } from './engines/tesseract-worker';
import { DocumentClassifier } from './classifiers/document-classifier';
import { Form16Extractor } from './extractors/form16.extractor';
import { SalarySlipExtractor } from './extractors/salary-slip.extractor';
import { BankStatementExtractor } from './extractors/bank-statement.extractor';
import { InvestmentProofExtractor } from './extractors/investment.extractor';
import { ExtractionValidator } from './validators/extraction-validator';
import { localStorageService } from './storage/local-storage.service';
import {
  DocumentCategoryType,
  DocumentExtractionResult,
  ExtractedFieldResult,
  ExtractedPageResult,
  OcrProcessingOptions,
  ValidationWarning,
} from './types';

export class DocumentPipelineService {
  /**
   * Processes an uploaded document through the complete local extraction pipeline.
   */
  public static async processDocument(
    documentId: string,
    options: OcrProcessingOptions = {}
  ): Promise<DocumentExtractionResult> {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Mark document as PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'PROCESSING',
        metadata: {
          step: 'READING_FILE',
          startedAt: new Date().toISOString(),
        },
      },
    });

    try {
      // 1. Read file buffer from private storage
      const fileBuffer = await localStorageService.readFile(doc.storageKey);

      let pages: ExtractedPageResult[] = [];
      let fullText = '';
      const isPdf = doc.mimeType === 'application/pdf';

      if (isPdf) {
        // Step A: Digital PDF text extraction
        const digitalResult = await PdfExtractor.extractText(fileBuffer);
        pages = digitalResult.pages;
        fullText = digitalResult.fullText;

        // Step B: Scanned PDF fallback for pages with negligible or zero text
        const maxPagesToProcess = options.maxPages || 10;
        for (const p of pages.slice(0, maxPagesToProcess)) {
          if (p.isScanned || options.forceOcr) {
            try {
              console.log(`[DocumentPipeline] Page ${p.pageNumber} appears scanned, rasterizing and running Tesseract OCR...`);
              const pageImg = await PdfRasterizer.rasterizePage(fileBuffer, p.pageNumber, 200);
              const ocrResult = await TesseractEngine.recognizeImage(pageImg, true);
              p.text = ocrResult.text;
              p.confidence = ocrResult.confidence;
              p.isScanned = true;
              fullText += (fullText ? '\n\n' : '') + `--- Page ${p.pageNumber} (OCR) ---\n` + ocrResult.text;
            } catch (rasterErr) {
              console.warn(`[DocumentPipeline] Failed to rasterize/OCR page ${p.pageNumber}:`, rasterErr);
            }
          }
        }
      } else {
        // Step C: Image OCR (PNG, JPEG, etc.)
        console.log(`[DocumentPipeline] Processing image file via Tesseract.js OCR...`);
        const ocrResult = await TesseractEngine.recognizeImage(fileBuffer, true);
        pages = [
          {
            pageNumber: 1,
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            isScanned: true,
          },
        ];
        fullText = ocrResult.text;
      }

      // Step 2: Document Classification
      const classification = DocumentClassifier.classify(fullText);
      const category: DocumentCategoryType =
        doc.category !== 'OTHER'
          ? (doc.category as DocumentCategoryType)
          : classification.category;

      console.log(`[DocumentPipeline] Classification: Detected ${classification.category} (${classification.confidence * 100}%), using ${category}`);

      // Step 3: Structured Field Extraction
      let fields: ExtractedFieldResult[] = [];
      let structuredData: Record<string, any> = {};
      let warnings: ValidationWarning[] = [];

      switch (category) {
        case 'FORM_16': {
          const res = Form16Extractor.extract(fullText, pages);
          fields = res.fields;
          structuredData = res.normalized;
          warnings = res.warnings;
          break;
        }
        case 'SALARY_SLIP': {
          const res = SalarySlipExtractor.extract(fullText, pages);
          fields = res.fields;
          structuredData = res.normalized;
          warnings = res.warnings;
          break;
        }
        case 'BANK_STATEMENT': {
          const res = BankStatementExtractor.extract(fullText, pages);
          fields = res.fields;
          structuredData = { ...res.normalized, transactions: res.transactions };
          warnings = res.warnings;
          break;
        }
        case 'INVESTMENT_PROOF':
        case 'INSURANCE_PREMIUM': {
          const res = InvestmentProofExtractor.extract(fullText, pages);
          fields = res.fields;
          structuredData = res.normalized;
          warnings = res.warnings;
          break;
        }
        default: {
          // Generic extraction
          const panMatch = fullText.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
          if (panMatch) {
            fields.push({
              fieldName: 'pan',
              fieldLabel: 'PAN Number',
              category: 'GENERAL',
              rawValue: panMatch[1],
              normalizedValue: panMatch[1],
              dataType: 'string',
              confidence: 0.9,
              pageNumber: 1,
              isVerified: false,
            });
          }
          break;
        }
      }

      // Step 4: Validation Engine
      const validationWarnings = ExtractionValidator.validate(fields);
      const combinedWarnings = [...warnings, ...validationWarnings];

      // Summary counts
      const highConfidenceFields = fields.filter((f) => f.confidence >= 0.8).length;
      const lowConfidenceFields = fields.filter((f) => f.confidence < 0.8).length;

      // Step 5: Atomic Database Persistence
      await prisma.$transaction(async (tx) => {
        // Clear previous pages and fields if re-processing
        await tx.extractedField.deleteMany({ where: { documentId } });
        await tx.documentPage.deleteMany({ where: { documentId } });

        // Insert pages
        for (const p of pages) {
          await tx.documentPage.create({
            data: {
              documentId,
              pageNumber: p.pageNumber,
              storageKey: doc.storageKey,
              ocrText: p.text.slice(0, 50000), // Protect against unbounded DB column size
              confidence: p.confidence,
            },
          });
        }

        // Insert extracted fields
        for (const f of fields) {
          await tx.extractedField.create({
            data: {
              documentId,
              fieldName: f.fieldName,
              rawValue: f.rawValue,
              normalizedValue: f.normalizedValue != null ? String(f.normalizedValue) : null,
              dataType: f.dataType,
              confidence: f.confidence,
              isVerified: false,
              sourceInfo: {
                label: f.fieldLabel,
                category: f.category,
                pageNumber: f.pageNumber,
                sourceTextSnippet: f.sourceTextSnippet,
                warning: f.warning,
                userCorrected: false,
              },
            },
          });
        }

        // Update Document record to PROCESSED
        await tx.document.update({
          where: { id: documentId },
          data: {
            status: 'PROCESSED',
            isVerified: false,
            processedAt: new Date(),
            metadata: {
              detectedCategory: classification.category,
              classificationConfidence: classification.confidence,
              classificationClues: classification.clues,
              pageCount: pages.length,
              warnings: combinedWarnings,
              summary: {
                totalFields: fields.length,
                highConfidenceFields,
                lowConfidenceFields,
                needsUserReview: lowConfidenceFields > 0 || combinedWarnings.length > 0,
              },
              structuredData,
            } as any,
          },
        });
      });

      console.log(`[DocumentPipeline] Successfully processed document ${documentId}: ${fields.length} fields extracted, ${combinedWarnings.length} warnings.`);

      return {
        documentId,
        category,
        detectedCategory: classification.category,
        classificationConfidence: classification.confidence,
        pages,
        fields,
        structuredData,
        validationWarnings: combinedWarnings,
        summary: {
          totalFields: fields.length,
          highConfidenceFields,
          lowConfidenceFields,
          needsUserReview: lowConfidenceFields > 0 || combinedWarnings.length > 0,
        },
      };
    } catch (err: any) {
      console.error(`[DocumentPipeline] Processing failed for document ${documentId}:`, err);

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'FAILED',
          metadata: {
            error: err.message || 'OCR and document parsing failed',
            failedAt: new Date().toISOString(),
          },
        },
      });

      throw err;
    }
  }
}
