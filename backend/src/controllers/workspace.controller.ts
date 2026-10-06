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
