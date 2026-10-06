import { Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { successResponse, asyncHandler } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const individualDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.getDashboardIndividual((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});

export const smeDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.getDashboardSME((req.params.workspaceId as string), req.user!.userId);
  res.json(successResponse(data));
});
