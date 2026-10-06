import prisma from '../config/prisma';
import { AppError } from '../utils/response';
import { AuditAction } from '@prisma/client';

export const getWorkspaces = async (userId: string) =>
  prisma.workspace.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export const createWorkspace = async (userId: string, data: {
  name: string; type: 'INDIVIDUAL' | 'SME'; pan?: string; phone?: string; address?: string;
}) => prisma.workspace.create({ data: { ...data, userId } });

export const getWorkspace = async (workspaceId: string, userId: string) => {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new AppError('Workspace not found', 404, 'NOT_FOUND');
  if (ws.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return ws;
};

export const updateWorkspace = async (workspaceId: string, userId: string, data: Partial<{
  name: string; pan: string; phone: string; address: string;
}>) => {
  await getWorkspace(workspaceId, userId);
  return prisma.workspace.update({ where: { id: workspaceId }, data });
};

export const deleteWorkspace = async (workspaceId: string, userId: string) => {
  await getWorkspace(workspaceId, userId);
  return prisma.workspace.delete({ where: { id: workspaceId } });
};

export const assertWorkspaceOwner = async (workspaceId: string, userId: string) => {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new AppError('Workspace not found', 404, 'NOT_FOUND');
  if (ws.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return ws;
};

export const createAuditLog = async (data: {
  userId?: string;
  workspaceId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    await prisma.auditLog.create({ data: data as any });
  } catch {
    // audit log failure must never break the main flow
  }
};
