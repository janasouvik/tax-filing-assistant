import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const syncUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const { email, name } = req.body;
    
    if (!auth.userId || !email) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing userId or email' } });
      return;
    }

    let user = await prisma.user.findUnique({ where: { clerkId: auth.userId } });

    if (!user) {
      // Create user if not exists
      user = await prisma.user.create({
        data: {
          clerkId: auth.userId,
          email: email,
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ').slice(1).join(' ') || '',
        }
      });
    }

    // Fetch workspaces to return
    const workspaces = await prisma.workspace.findMany({
      where: { userId: user.id }
    });

    res.status(200).json({
      user,
      workspaces
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { workspaces: true }
    });

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
