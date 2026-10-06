import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const generateApprovalHash = (taxReturnId: string, userId: string, timestamp: string): string =>
  crypto.createHash('sha256').update(`${taxReturnId}:${userId}:${timestamp}`).digest('hex');

export const generateId = (): string => uuidv4();

export const getClientIp = (req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
