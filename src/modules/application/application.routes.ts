import express from 'express';
import * as ApplicationController from './application.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';
import { validate } from '../../middleware/validate.middleware';
import { submitApplicationSchema, updateApplicationStatusSchema, approveStageSchema } from './application.validator';

import { UserPermission } from '../user/user.interface';

import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]),
  upload.single('file'), // Handle PDF/Image attachment
  validate(submitApplicationSchema),
  ApplicationController.submitApplication
);

router.get(
  '/me',
  auth([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]),
  ApplicationController.getMyApplications
);

router.get(
  '/',
  auth(), // Service handles filtering based on role/permissions
  ApplicationController.getAllApplications
);

router.get(
  '/:id',
  auth(),
  ApplicationController.getApplicationById
);

router.patch(
  '/:id/status',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_APPLICATIONS]),
  validate(updateApplicationStatusSchema),
  ApplicationController.updateStatus
);

router.post(
  '/:id/approve-stage',
  auth(
    [UserRole.ADMIN, UserRole.TEACHER], 
    [
      UserPermission.MANAGE_APPLICATIONS, 
      UserPermission.APPROVE_APPLICATION_L0,
      UserPermission.APPROVE_APPLICATION_L1,
      UserPermission.APPROVE_APPLICATION_L2
    ]
  ),
  validate(approveStageSchema),
  ApplicationController.approveStage
);

// Public verification route
router.get(
  '/verify/:code',
  ApplicationController.getApplicationById // Reuse by ID if we add logic to find by code too
);

export const ApplicationRoutes = router;
