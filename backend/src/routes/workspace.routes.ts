import { Router } from 'express';
import * as ctrl from '../controllers/workspace.controller';
import { authenticate, loadUser } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { upload } from '../middlewares/upload';
import { workspaceSchema, workspacePatchSchema } from '../validators';

const router = Router();
router.use(authenticate, loadUser);

// Workspace CRUD (supports both root-relative and /workspaces paths)
router.get(['/', '/workspaces'], ctrl.getWorkspaces);
router.post(['/', '/workspaces'], validate(workspaceSchema), ctrl.createWorkspace);
router.get(['/:workspaceId', '/workspaces/:workspaceId'], ctrl.getWorkspace);
router.patch(['/:workspaceId', '/workspaces/:workspaceId'], validate(workspacePatchSchema), ctrl.updateWorkspace);
router.delete(['/:workspaceId', '/workspaces/:workspaceId'], ctrl.deleteWorkspace);

// Workspace Document Management
router.get('/workspaces/:workspaceId/documents', ctrl.getWorkspaceDocuments);
router.post('/workspaces/:workspaceId/documents', upload.single('file'), ctrl.uploadWorkspaceDocument);
router.get('/documents/:documentId', ctrl.getDocument);
router.delete('/documents/:documentId', ctrl.deleteDocument);

export default router;
