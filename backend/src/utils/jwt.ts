import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  workspaceId?: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] });

export const signRefreshToken = (payload: { userId: string }): string =>
  jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, config.jwt.accessSecret) as TokenPayload;

export const verifyRefreshToken = (token: string): { userId: string } =>
  jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
