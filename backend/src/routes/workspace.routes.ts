import { Router } from 'express';
import * as ctrl from '../controllers/workspace.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { workspaceSchema, workspacePatchSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getWorkspaces);
router.post('/', validate(workspaceSchema), ctrl.createWorkspace);
router.get('/:workspaceId', ctrl.getWorkspace);
router.patch('/:workspaceId', validate(workspacePatchSchema), ctrl.updateWorkspace);
router.delete('/:workspaceId', ctrl.deleteWorkspace);

export default router;
