import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import * as ctrl from '../controllers/auth.controller';
import { authenticate, loadUser } from '../middlewares/auth';

const router = Router();

// Endpoint called by frontend after Clerk login to sync the user in our database
// Notice we only use `requireAuth` here, not `loadUser`, because `loadUser` expects the DB user to exist!
router.post('/sync', requireAuth({ signInUrl: undefined }), ctrl.syncUser);
router.get('/me', authenticate, loadUser, ctrl.me);

export default router;
