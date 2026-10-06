import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { AppError } from '../utils/response';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  auth?: ReturnType<typeof getAuth>;
  user?: { userId: string };
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    return;
  }
  next();
};

export const loadUser = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return next(new AppError('No authenticated user', 401, 'UNAUTHORIZED'));

    // Find the user in DB by clerkId
    const user = await prisma.user.findUnique({ where: { clerkId: auth.userId } });
    if (!user) return next(new AppError('User not found in DB', 401, 'UNAUTHORIZED'));

    req.user = { userId: user.id };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireOwnership = (getWorkspaceId: (req: AuthRequest) => string | undefined) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const workspaceId = getWorkspaceId(req);
    if (!workspaceId) return next();
    next();
  };
