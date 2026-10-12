import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface CanonicalFinancialSnapshot {
  taxReturnId: string;
  userId: string;
  assessmentYear: string;
  regime: string;
  ruleVersion: string;
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxLiability: number;
  totalTax: number;
  tdsDeducted: number;
  refundPayable: number;
  calculationId: string;
  timestamp: string;
}

export const canonicalJsonStringify = (obj: Record<string, any>): string => {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
};

export function generateApprovalHash(snapshot: CanonicalFinancialSnapshot): string;
export function generateApprovalHash(taxReturnId: string, userId: string, timestamp: string): string;
export function generateApprovalHash(
  snapshotOrReturnId: CanonicalFinancialSnapshot | string,
  userId?: string,
  timestamp?: string
): string {
  if (typeof snapshotOrReturnId === 'object' && snapshotOrReturnId !== null) {
    const canonicalStr = canonicalJsonStringify(snapshotOrReturnId as Record<string, any>);
    return crypto.createHash('sha256').update(canonicalStr).digest('hex');
  }
  return crypto.createHash('sha256').update(`${snapshotOrReturnId}:${userId}:${timestamp}`).digest('hex');
}

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
