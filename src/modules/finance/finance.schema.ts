import { Schema, model } from 'mongoose';
import { ITransaction } from './finance.interface';
import { TransactionCategory, TransactionType } from './finance.types';

const transactionSchema = new Schema<ITransaction>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(TransactionCategory),
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-find hook to filter out deleted transactions
transactionSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema as any);
