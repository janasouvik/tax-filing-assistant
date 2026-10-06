import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { successResponse, asyncHandler } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body.email, req.body.name, req.body.password);
  res.status(201).json(successResponse(user));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body.email, req.body.password);
  res.json(successResponse(result));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.json(successResponse(result));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutUser(req.body.refreshToken);
  res.json(successResponse({ message: 'Logged out successfully' }));
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json(successResponse(user));
});
