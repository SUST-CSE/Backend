import { z } from 'zod';
import { PaymentCategory, PaymentMethod, PaymentStatus } from './payment.types';

export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  category: z.nativeEnum(PaymentCategory),
  method: z.nativeEnum(PaymentMethod),
  referenceId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  transactionId: z.string().optional(),
});
