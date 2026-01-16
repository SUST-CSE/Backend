import { Payment } from './payment.schema';
import { NotFoundError } from '@/utils/errors';
import { PaymentStatus } from './payment.types';
import crypto from 'crypto';

export const initiatePayment = async (data: any, userId: string) => {
  // Generate a mock transaction ID for now
  const transactionId = `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  return await Payment.create({
    ...data,
    transactionId,
    user: userId,
    status: PaymentStatus.PENDING,
  });
};

export const handleWebhook = async (transactionId: string, status: PaymentStatus, metadata?: any) => {
  const payment = await Payment.findOneAndUpdate(
    { transactionId },
    { status, metadata: { ...metadata, webhookReceivedAt: new Date() } },
    { new: true }
  );

  if (!payment) throw new NotFoundError('Payment transaction not found');
  return payment;
};

export const getPaymentHistory = async (query: any, userId?: string) => {
  const filter: any = { isDeleted: false };
  if (userId) filter.user = userId;
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;

  return await Payment.find(filter)
    .populate('user', 'name email studentId')
    .sort({ createdAt: -1 });
};

export const getPaymentById = async (id: string, userId?: string) => {
  const filter: any = { _id: id };
  if (userId) filter.user = userId;

  const payment = await Payment.findOne(filter).populate('user', 'name email studentId');
  if (!payment) throw new NotFoundError('Payment record not found');
  return payment;
};
