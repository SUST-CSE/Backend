import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as FinanceController from './finance.controller';
import { upload } from '../../middleware/upload.middleware';
import { addTransactionSchema } from './finance.validator';

import { CostRoutes } from './cost.routes';
import { UserRole } from '../user/user.types';
import { UserPermission } from '../user/user.interface';

const router = express.Router();

router.post(
  '/',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACCOUNTS]),
  upload.array('proof', 5),
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

// Mount Cost Routes
router.use('/cost', CostRoutes);

console.log('✅ Finance Routes Module Loaded');
export const FinanceRoutes = router;
