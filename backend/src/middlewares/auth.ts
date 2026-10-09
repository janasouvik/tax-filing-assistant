import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
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

export const loadUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const token = req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null;
      
    // Diagnostics
    console.log('[AUTH_DIAGNOSTIC]', {
      ready: true,
      hasToken: !!token,
      method: req.method,
      route: req.originalUrl || req.url,
    });

    if (!auth.userId) {
      console.log('[AUTH_DIAGNOSTIC] Failure category: No authenticated user (Missing or invalid token)');
      return next(new AppError('No authenticated user', 401, 'UNAUTHORIZED'));
    }

    // Find the user in DB by clerkId
    let user = await prisma.user.findUnique({ where: { clerkId: auth.userId } });
    
    if (!user) {
      console.log(`[AUTH_DIAGNOSTIC] User ${auth.userId} not found in DB. Synchronizing from Clerk...`);
      try {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        
        user = await prisma.user.create({
          data: {
            clerkId: auth.userId,
            email: email,
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
          }
        });
        console.log(`[AUTH_DIAGNOSTIC] Successfully synchronized user ${auth.userId} to DB.`);
      } catch (syncError) {
        console.error('[AUTH_DIAGNOSTIC] Failed to synchronize user:', syncError);
        console.log('[AUTH_DIAGNOSTIC] Failure category: Internal user synchronization failed');
        return next(new AppError('Internal user synchronization failed', 500, 'INTERNAL_SERVER_ERROR'));
      }
    }

    req.user = { userId: user.id };
    next();
  } catch (error) {
    console.error('[AUTH_DIAGNOSTIC] Middleware error:', error);
    console.log('[AUTH_DIAGNOSTIC] Failure category: Middleware execution error');
    next(error);
  }
};

export const requireOwnership = (getWorkspaceId: (req: AuthRequest) => string | undefined) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const workspaceId = getWorkspaceId(req);
    if (!workspaceId) return next();
    next();
  };
