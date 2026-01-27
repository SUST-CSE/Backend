import express from 'express';
import * as FinanceController from './finance.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';
import { UserPermission } from '../user/user.interface';
import { validate } from '../../middleware/validate.middleware';
import { addTransactionSchema } from './finance.validator';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  validate(addTransactionSchema),
  FinanceController.addTransaction
);

router.get(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  FinanceController.getTransactions
);

router.get(
  '/summary',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  FinanceController.getSummary
);

router.delete(
  '/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  FinanceController.deleteTransaction
);

export const FinanceRoutes = router;
