import express from 'express';
import * as FinanceController from './finance.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';
import { UserPermission } from '../user/user.interface';
import { validate } from '../../middleware/validate.middleware';
import { upload } from '../../middleware/upload.middleware';
import { addTransactionSchema } from './finance.validator';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  upload.single('proof'),
  validate(addTransactionSchema),
  FinanceController.addTransaction
);

router.get(
  '/',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  FinanceController.getTransactions
);

router.get(
  '/summary',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
  FinanceController.getSummary
);

router.delete(
  '/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  FinanceController.deleteTransaction
);

export const FinanceRoutes = router;
