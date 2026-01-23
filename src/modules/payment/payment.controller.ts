import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as PaymentService from './payment.service';
import { UserRole } from '../../modules/user/user.types';

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await PaymentService.initiatePayment(req.body, userId);
  successResponse(res, result, 'Payment initiated successfully', 201);
});

export const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await PaymentService.getPaymentHistory(req.query, userId);
  successResponse(res, result, 'Your payment history fetched successfully');
});

export const getAllPayments = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentHistory(req.query);
  successResponse(res, result, 'All payment records fetched successfully');
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.role === UserRole.ADMIN ? undefined : user._id;
  const result = await PaymentService.getPaymentById(req.params.id as string, userId);
  successResponse(res, result, 'Payment details fetched successfully');
});

export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { transactionId, status } = req.body;
  const result = await PaymentService.handleWebhook(transactionId, status, req.body.metadata);
  successResponse(res, result, 'Payment status updated successfully');
});
