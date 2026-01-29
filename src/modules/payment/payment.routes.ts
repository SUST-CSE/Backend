import express from 'express';
import * as PaymentController from './payment.controller';
import { validate } from '../../middleware/validate.middleware';
import { createPaymentSchema, updatePaymentStatusSchema } from './payment.validator';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../modules/user/user.types';

const router = express.Router();

router.get('/my', auth(UserRole.STUDENT), PaymentController.getMyPayments);
router.get('/history', auth(UserRole.STUDENT), PaymentController.getMyPayments); // Added history route
router.get('/all', auth(UserRole.ADMIN), PaymentController.getAllPayments);
router.get('/:id', auth(), PaymentController.getPaymentById);

router.post(
  '/initiate',
  auth(UserRole.STUDENT),
  validate(createPaymentSchema),
  PaymentController.initiatePayment
);

router.post(
  '/status-update',
  auth(UserRole.ADMIN), // Simulating webhook or manual admin update
  validate(updatePaymentStatusSchema),
  PaymentController.updatePaymentStatus
);

export const PaymentRoutes = router;
