import { Types } from 'mongoose';
import { PaymentCategory, PaymentMethod, PaymentStatus } from './payment.types';

export interface IPayment {
  _id: Types.ObjectId;
  transactionId: string;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  category: PaymentCategory;
  method: PaymentMethod;
  referenceId?: string; // Event ID, Society ID, etc.
  description: string;
  metadata?: Record<string, any>;
  isDeleted: boolean;
}
