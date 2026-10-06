import { Response } from 'express';
import * as copilotService from '../modules/copilot/copilot.service';
import { successResponse, asyncHandler } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await copilotService.getConversations((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const createConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await copilotService.createConversation((req.params.workspaceId as string), req.user!.userId, req.body);
  res.status(201).json(successResponse(data));
});

export const getConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await copilotService.getConversation((req.params.conversationId as string), (req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await copilotService.sendMessage(
    (req.params.conversationId as string),
    (req.params.workspaceId as string),
    req.user!.userId,
    req.body.content,
    req.body.taxReturnId,
  );
  res.status(201).json(successResponse(data));
});

export const deleteConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  await copilotService.deleteConversation((req.params.conversationId as string), (req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse({ message: 'Conversation deleted' }));
});
