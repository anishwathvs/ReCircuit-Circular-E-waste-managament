import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'recircuit-super-secret-jwt-key-2026-circular-economy';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'recircuit-super-refresh-secret-jwt-key-2026-circular-economy';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  tokenVersion?: number;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

