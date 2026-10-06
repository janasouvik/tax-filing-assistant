import { Router } from 'express';
import * as ctrl from '../controllers/copilot.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { copilotMessageSchema, copilotConversationSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/workspaces/:workspaceId/copilot/conversations', ctrl.getConversations);
router.post('/workspaces/:workspaceId/copilot/conversations', validate(copilotConversationSchema), ctrl.createConversation);
router.get('/workspaces/:workspaceId/copilot/conversations/:conversationId', ctrl.getConversation);
router.post('/workspaces/:workspaceId/copilot/conversations/:conversationId/messages', validate(copilotMessageSchema), ctrl.sendMessage);
router.delete('/workspaces/:workspaceId/copilot/conversations/:conversationId', ctrl.deleteConversation);

export default router;
