import express from 'express';
import * as ApplicationController from './application.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';
import { validate } from '../../middleware/validate.middleware';
import { submitApplicationSchema, updateApplicationStatusSchema } from './application.validator';

import { UserPermission } from '../user/user.interface';

import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.STUDENT]),
  upload.single('file'), // Handle PDF/Image attachment
  validate(submitApplicationSchema),
  ApplicationController.submitApplication
);

router.get(
  '/me',
  auth([UserRole.STUDENT]),
  ApplicationController.getMyApplications
);

router.get(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_APPLICATIONS]),
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

export const ApplicationRoutes = router;
