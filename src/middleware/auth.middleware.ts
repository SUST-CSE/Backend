import { NextFunction, Request, Response } from 'express';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler.util';
import { verifyToken } from '../utils/jwt.util';
import { env } from '../config/env';
import { User } from '../modules/user/user.schema';
import { UserPermission } from '../modules/user/user.interface';
import { UserRole } from '../modules/user/user.types';

export const auth = (roles: UserRole[] = [], permissions: UserPermission[] = []) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('You are not logged in! Please log in to get access.');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    try {
      const decoded = verifyToken(token, env.JWT_SECRET);

      // 3. Check if user still exists
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        throw new AuthenticationError('The user belonging to this token no longer exists.');
      }

      // 4. Check if user is active
      if (currentUser.status !== 'ACTIVE') {
        throw new AuthenticationError('Your account is not active.');
      }

      // 5. Grant access if Admin
      if (currentUser.role === UserRole.ADMIN) {
        (req as any).user = currentUser;
        return next();
      }

      // 6. Check if user has required role
      const hasRequiredRole = roles.length === 0 || roles.includes(currentUser.role);
      
      // 7. Check if user has any of the required permissions
      const userPermissions = currentUser.permissions || [];
      const hasRequiredPermission = permissions.length > 0 && permissions.some(p => userPermissions.includes(p));

      if (!hasRequiredRole && !hasRequiredPermission) {
        console.warn(`🚫 Access Denied: User ${currentUser.email} lacks required roles or permissions`);
        throw new AuthorizationError('You do not have permission to perform this action');
      }

      // Grant access to protected route
      (req as any).user = currentUser;
      next();
    } catch (error: any) {
      throw new AuthenticationError(`Invalid token or token expired. Details: ${error.message}`);
    }
  });
};
