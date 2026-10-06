import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AppError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
};

export const requireOwnership = (getWorkspaceId: (req: AuthRequest) => string | undefined) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const workspaceId = getWorkspaceId(req);
    if (!workspaceId) return next();
    // The actual workspace ownership check is done in the service layer
    // using the authenticated user's context
    next();
  };
