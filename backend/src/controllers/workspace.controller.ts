import { Response } from 'express';
import * as workspaceService from '../services/workspace.service';
import { successResponse, asyncHandler } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const getWorkspaces = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await workspaceService.getWorkspaces(req.user!.userId);
  res.json(successResponse(data));
});

export const createWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await workspaceService.createWorkspace(req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const getWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await workspaceService.getWorkspace((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const updateWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await workspaceService.updateWorkspace((req.params.workspaceId as string), req.user!.userId, req.body);
  res.json(successResponse(data));
});

export const deleteWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  await workspaceService.deleteWorkspace((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse({ message: 'Workspace deleted' }));
});

// Document Management
import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { detectMimeTypeFromBuffer } from '../middlewares/upload';
import { invalidateTaxCalculationsAndResetStatus } from '../services/taxReturn.service';

export const uploadWorkspaceDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const workspaceId = req.params.workspaceId as string;
  await workspaceService.assertWorkspaceOwner(workspaceId, req.user!.userId);

  if (!req.file) {
    return next(new AppError('No document file uploaded', 400, 'FILE_MISSING'));
  }

  const file = req.file;

  // Magic byte inspection (do not trust user-supplied mimetype alone)
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

  // Sanitize filename and storageKey to avoid path traversal and data exposure
  const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
  const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '';
  const fileUuid = crypto.randomUUID();
  const storageKey = `documents/${workspaceId}/${fileUuid}${safeExt}`;
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
        status: 'PROCESSED',
        isVerified: true,
        processedAt: new Date(),
      },
    });

    if (taxReturn?.id) {
      await invalidateTaxCalculationsAndResetStatus(taxReturn.id, tx);
    }

    return createdDoc;
  });

  res.status(201).json(successResponse(doc));
});

export const getWorkspaceDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  await workspaceService.assertWorkspaceOwner(workspaceId, req.user!.userId);

  const docs = await prisma.document.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(successResponse(docs));
});

export const getDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.documentId as string },
    include: { workspace: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  res.json(successResponse(doc));
});

export const deleteDocument = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.documentId as string },
    include: { workspace: true, taxReturn: true },
  });

  if (!doc) return next(new AppError('Document not found', 404, 'NOT_FOUND'));
  if (doc.workspace.userId !== req.user!.userId) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));

  const lockedStates = ['PROCESSING', 'SUBMISSION_UNKNOWN', 'FILED'];
  if (doc.taxReturn && lockedStates.includes(doc.taxReturn.status)) {
    return next(new AppError(`Cannot delete documents from a locked tax return (${doc.taxReturn.status})`, 403, 'LOCKED_RETURN'));
  }

  await prisma.$transaction(async (tx) => {
    await tx.document.delete({ where: { id: doc.id } });
    if (doc.taxReturnId) {
      await invalidateTaxCalculationsAndResetStatus(doc.taxReturnId, tx);
    }
  });

  res.json(successResponse({ message: 'Document deleted' }));
});

