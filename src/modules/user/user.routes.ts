import express from 'express';
import * as UserController from './user.controller';
import { auth } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import { UserRole } from './user.types';

import { UserPermission } from './user.interface';

const router = express.Router();

router.get(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_USERS]),
  UserController.getAllUsers
);

router.post(
  '/bulk-create',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_USERS]),
  UserController.bulkCreateUsers
);

router.get(
  '/faculty',
  UserController.getFaculty
);

router.get(
  '/students',
  auth([]),
  UserController.getStudents
);

router.patch(
  '/me',
  auth([]),
  upload.single('profileImage'),
  UserController.updateMyProfile
);

router.patch(
  '/:id/status',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_USERS]),
  UserController.updateUserStatus
);

router.patch(
  '/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_USERS]),
  UserController.updateUser
);

router.delete(
  '/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_USERS]),
  UserController.deleteUser
);

router.get(
  '/:id',
  UserController.getUserById
);

export const UserRoutes = router;
