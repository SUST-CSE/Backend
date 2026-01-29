import express from 'express';
import * as WorkAssignmentController from './work-assignment.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';
import { validate } from '../../middleware/validate.middleware';
import { createAssignmentSchema, updateStatusSchema } from './work-assignment.validator';
import { UserPermission } from '../user/user.interface';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT], [UserPermission.MANAGE_WORK]),
  validate(createAssignmentSchema),
  WorkAssignmentController.createAssignment
);

router.get(
  '/me',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  WorkAssignmentController.getMyWork
);

router.get(
  '/society/:societyId',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  WorkAssignmentController.getSocietyWork
);

router.get(
  '/',
  auth([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT], [UserPermission.MANAGE_WORK]),
  WorkAssignmentController.getAllWork
);

router.patch(
  '/:id/status',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  validate(updateStatusSchema),
  WorkAssignmentController.updateStatus
);

export const WorkAssignmentRoutes = router;
