import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upload } from '../../middleware/upload.middleware';
import * as StatementController from './statement.controller';
import { createStatementSchema } from './statement.validator';
import { UserRole } from '../user/user.types';
import { UserPermission } from '../user/user.interface';

const router = express.Router();

// Admin: Create a financial statement (with document uploads)
router.post(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  upload.array('documents', 10),
  validate(createStatementSchema),
  StatementController.createStatement
);

// All authenticated users: Get all published statements
router.get(
  '/',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  StatementController.getAllStatements
);

// Get single statement
router.get(
  '/:id',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  StatementController.getStatementById
);

// Admin: Update statement
router.put(
  '/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  upload.array('documents', 10),
  StatementController.updateStatement
);

// Admin: Delete statement
router.delete(
  '/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  StatementController.deleteStatement
);

// Admin: Toggle publish status
router.patch(
  '/:id/toggle-publish',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  StatementController.togglePublish
);

console.log(' Statement Routes Module Loaded');
export const StatementRoutes = router;
