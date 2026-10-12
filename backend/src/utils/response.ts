import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown[];
}

export class AppError extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: unknown[];

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const successResponse = <T>(data: T, meta?: Record<string, unknown>) => ({
  data,
  meta: meta || {},
});

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  const isProduction = process.env.NODE_ENV === 'production';
  const isInternal = statusCode >= 500;

  const safeMessage = isProduction && isInternal
    ? 'An unexpected internal error occurred'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: {
      code,
      message: safeMessage,
      details: isProduction && isInternal ? [] : err.details || [],
    },
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
