import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';
import { PaymentCategory, PaymentMethod, PaymentStatus } from './payment.types';

const paymentSchema = new Schema<IPayment>(
  {
    transactionId: { type: String, required: true, unique: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    category: {
      type: String,
      enum: Object.values(PaymentCategory),
      required: true,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    referenceId: { type: String },
    description: { type: String, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Filter out deleted payments
paymentSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const Payment = model<IPayment>('Payment', paymentSchema);
