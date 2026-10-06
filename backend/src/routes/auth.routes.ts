import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { registerSchema, loginSchema, refreshSchema } from '../validators';

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', validate(refreshSchema), ctrl.logout);
router.get('/me', authenticate, ctrl.me);

export default router;
