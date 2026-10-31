import { Response, NextFunction } from 'express';
import path from 'path';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { AppError, asyncHandler, successResponse } from '../utils/response';
import { detectMimeTypeFromBuffer } from '../middlewares/upload';
import { localStorageService } from '../modules/ocr/storage/local-storage.service';
import { DocumentPipelineService } from '../modules/ocr/document-pipeline.service';
import { DocumentVerificationService } from '../modules/ocr/document-verification.service';
import { invalidateTaxCalculationsAndResetStatus } from '../services/taxReturn.service';
import * as workspaceService from '../services/workspace.service';

/**
 * Uploads a document, writes it to private disk storage, and triggers the OCR pipeline.
 */
export const uploadDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const workspaceId = req.params.workspaceId as string;
  await workspaceService.assertWorkspaceOwner(workspaceId, req.user!.userId);

  if (!req.file) {
    return next(new AppError('No document file uploaded', 400, 'FILE_MISSING'));
  }

  const file = req.file;

  // Magic byte inspection
  const detectedMime = detectMimeTypeFromBuffer(file.buffer);
  if (!detectedMime) {
    return next(new AppError('Invalid or corrupted file content. File failed magic byte validation.', 400, 'INVALID_FILE_SIGNATURE'));
  }

  // Find active tax return for workspace
  const taxReturn = await prisma.taxReturn.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  const lockedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'];
  if (taxReturn && lockedStates.includes(taxReturn.status)) {
    return next(new AppError(`Cannot upload documents to a locked tax return (${taxReturn.status})`, 403, 'LOCKED_RETURN'));
  }

  // Generate private local storage key and save file buffer to disk
  const { storageKey } = localStorageService.generateStorageKey(workspaceId, file.originalname);
  await localStorageService.saveFile(storageKey, file.buffer);

  const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
  const category = (req.body.category as any) || 'OTHER';

  const doc = await prisma.$transaction(async (tx) => {
    const createdDoc = await tx.document.create({
      data: {
        workspaceId,
        taxReturnId: taxReturn?.id || null,
        name: sanitizedName,
        originalName: sanitizedName,
        mimeType: detectedMime,
        sizeBytes: file.size,
        storageKey,
        category,
        status: 'PENDING',
        isVerified: false,
        metadata: {
          step: 'QUEUED',
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    if (taxReturn?.id) {
      await invalidateTaxCalculationsAndResetStatus(taxReturn.id, tx, `Document ${sanitizedName} uploaded`);
    }

    return createdDoc;
  });

  // Trigger OCR extraction asynchronously so client receives immediate 201
  DocumentPipelineService.processDocument(doc.id, {
    forceOcr: req.body.forceOcr === 'true' || req.body.forceOcr === true,
  }).catch((err) => {
    console.error(`[DocumentController] Background OCR failed for ${doc.id}:`, err);
  });

  res.status(201).json(successResponse(doc));
});

/**
 * Lists all documents in a workspace.
 */
export const getWorkspaceDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  await workspaceService.assertWorkspaceOwner(workspaceId, req.user!.userId);

  const docs = await prisma.document.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: { pages: true, extractedFields: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(successResponse(docs));
});

/**
 * Gets a single document by ID with pages and extracted fields.
 */
export const getDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      workspace: true,
      pages: {
        select: { id: true, pageNumber: true, confidence: true },
        orderBy: { pageNumber: 'asc' },
      },
      extractedFields: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  res.json(successResponse(doc));
});

/**
 * Streams the document file securely for two-panel in-browser preview.
 */
export const streamDocumentFile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { workspace: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  if (!localStorageService.fileExists(doc.storageKey)) {
    return next(new AppError('Stored document file not found on disk', 404, 'FILE_NOT_FOUND'));
  }

  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${doc.name}"`);
  res.setHeader('Cache-Control', 'private, max-age=3600');

  const stream = localStorageService.createReadStream(doc.storageKey);
  stream.on('error', (err) => next(err));
  stream.pipe(res);
});

/**
 * Returns real-time processing status.
 */
export const getDocumentStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { workspace: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  const meta = (doc.metadata as any) || {};
  res.json(
    successResponse({
      id: doc.id,
      status: doc.status,
      isVerified: doc.isVerified,
      category: doc.category,
      detectedCategory: meta.detectedCategory,
      step: meta.step,
      pageCount: meta.pageCount || 0,
      summary: meta.summary || null,
      warnings: meta.warnings || [],
      error: meta.error || null,
    })
  );
});

/**
 * Gets extracted fields and validation warnings.
 */
export const getExtractedData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      workspace: true,
      extractedFields: true,
    },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  const meta = (doc.metadata as any) || {};

  res.json(
    successResponse({
      documentId: doc.id,
      category: doc.category,
      detectedCategory: meta.detectedCategory || doc.category,
      fields: doc.extractedFields,
      structuredData: meta.structuredData || {},
      warnings: meta.warnings || [],
      summary: meta.summary || null,
    })
  );
});

/**
 * Allows the assessee to correct or override extracted values before verification.
 */
export const updateExtractedData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { workspace: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  const { fields } = req.body;
  if (!fields || typeof fields !== 'object') {
    return next(new AppError('fields object is required in request body', 400, 'INVALID_PAYLOAD'));
  }

  for (const [fieldName, newValue] of Object.entries(fields)) {
    const existing = await prisma.extractedField.findFirst({
      where: { documentId: docId, fieldName },
    });

    if (existing) {
      await prisma.extractedField.update({
        where: { id: existing.id },
        data: {
          normalizedValue: newValue != null ? String(newValue) : null,
          sourceInfo: {
            ...((existing.sourceInfo as any) || {}),
            userCorrected: true,
            originalValue: existing.rawValue,
          },
        },
      });
    } else {
      await prisma.extractedField.create({
        data: {
          documentId: docId,
          fieldName,
          rawValue: String(newValue),
          normalizedValue: String(newValue),
          dataType: typeof newValue === 'number' ? 'number' : 'string',
          confidence: 1.0,
          isVerified: false,
          sourceInfo: {
            userCorrected: true,
            manuallyAdded: true,
          },
        },
      });
    }
  }

  const updatedFields = await prisma.extractedField.findMany({ where: { documentId: docId } });
  res.json(successResponse(updatedFields));
});

/**
 * Verifies document and synchronizes verified values into IncomeEntry and Deduction.
 */
export const verifyDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const result = await DocumentVerificationService.verifyAndApplyToTaxReturn(
    docId,
    req.user!.userId,
    req.body.overrides
  );

  res.json(successResponse(result));
});

/**
 * Reprocesses a document through OCR.
 */
export const reprocessDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { workspace: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  // Trigger re-processing
  DocumentPipelineService.processDocument(docId, {
    forceOcr: req.body.forceOcr === true || req.body.forceOcr === 'true',
  }).catch((err) => {
    console.error(`[DocumentController] Reprocessing failed for ${docId}:`, err);
  });

  res.json(successResponse({ message: 'Reprocessing initiated', documentId: docId }));
});

/**
 * Securely deletes a document, cleans up disk storage, and invalidates tax return if needed.
 */
export const deleteDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const docId = (req.params.id || req.params.documentId) as string;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { workspace: true, taxReturn: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  const lockedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'];
  if (doc.taxReturn && lockedStates.includes(doc.taxReturn.status)) {
    return next(new AppError(`Cannot delete documents from a locked tax return (${doc.taxReturn.status})`, 403, 'LOCKED_RETURN'));
  }

  // Delete physical file from disk
  await localStorageService.deleteFile(doc.storageKey);

  // Delete database record and cascade
  await prisma.$transaction(async (tx) => {
    // Delete associated income and deductions imported from this document
    await tx.incomeEntry.deleteMany({ where: { sourceDocumentId: doc.id } });
    await tx.deduction.deleteMany({ where: { sourceDocumentId: doc.id } });

    await tx.document.delete({ where: { id: doc.id } });

    if (doc.taxReturnId) {
      await invalidateTaxCalculationsAndResetStatus(doc.taxReturnId, tx, `Document ${doc.name} deleted`);
    }
  });

  res.json(successResponse({ message: 'Document deleted successfully' }));
});
