import express from 'express';
import * as UserController from './user.controller';
import { auth } from '@/middleware/auth.middleware';
import { UserRole } from './user.types';

const router = express.Router();

router.get(
  '/',
  auth(UserRole.ADMIN), // Only admins can list users
  UserController.getAllUsers
);

export const UserRoutes = router;
