import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../modules/user/user.types';

export interface IJwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export const generateAccessToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string, secret: string): IJwtPayload => {
  return jwt.verify(token, secret) as IJwtPayload;
};
