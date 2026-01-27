import express from 'express';
import * as WorkAssignmentController from './work-assignment.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';
import { validate } from '../../middleware/validate.middleware';
import { createAssignmentSchema, updateStatusSchema } from './work-assignment.validator';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.ADMIN]),
  validate(createAssignmentSchema),
  WorkAssignmentController.createAssignment
);

router.get(
  '/me',
  auth([]),
  WorkAssignmentController.getMyWork
);

router.get(
  '/society/:societyId',
  auth([]),
  WorkAssignmentController.getSocietyWork
);

router.get(
  '/',
  auth([UserRole.ADMIN]),
  WorkAssignmentController.getAllWork
);

router.patch(
  '/:id/status',
  auth([]),
  validate(updateStatusSchema),
  WorkAssignmentController.updateStatus
);

export const WorkAssignmentRoutes = router;
