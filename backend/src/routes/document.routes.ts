import { Router } from 'express';
import * as docCtrl from '../controllers/document.controller';
import { authenticate, loadUser } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();
router.use(authenticate, loadUser);

// Document Ingestion
router.post('/workspaces/:workspaceId/documents', upload.single('file'), docCtrl.uploadDocument);
router.get('/workspaces/:workspaceId/documents', docCtrl.getWorkspaceDocuments);

// Single Document Operations
router.get('/documents/:id', docCtrl.getDocument);
router.get('/documents/:id/file', docCtrl.streamDocumentFile);
router.get('/documents/:id/status', docCtrl.getDocumentStatus);
router.get('/documents/:id/extracted-data', docCtrl.getExtractedData);
router.put('/documents/:id/extracted-data', docCtrl.updateExtractedData);
router.post('/documents/:id/verify', docCtrl.verifyDocument);
router.post('/documents/:id/reprocess', docCtrl.reprocessDocument);
router.delete('/documents/:id', docCtrl.deleteDocument);

// Backwards-compatible aliases for :documentId param
router.get('/documents/:documentId/file', docCtrl.streamDocumentFile);
router.get('/documents/:documentId/status', docCtrl.getDocumentStatus);
router.get('/documents/:documentId/extracted-data', docCtrl.getExtractedData);
router.put('/documents/:documentId/extracted-data', docCtrl.updateExtractedData);
router.post('/documents/:documentId/verify', docCtrl.verifyDocument);
router.post('/documents/:documentId/reprocess', docCtrl.reprocessDocument);

export default router;

