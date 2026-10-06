import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate, loadUser } from '../middlewares/auth';

const router = Router();
router.use(authenticate, loadUser);

router.get('/workspaces/:workspaceId/dashboard/individual', ctrl.individualDashboard);
router.get('/workspaces/:workspaceId/dashboard/sme', ctrl.smeDashboard);

export default router;
