import { z } from 'zod';
import { TransactionCategory, TransactionType } from './finance.types';

export const addTransactionSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string().optional(),
  amount: z.number({ required_error: 'Amount is required' }).min(1, 'Amount must be at least 1'),
  type: z.nativeEnum(TransactionType, { required_error: 'Type is required' }),
  category: z.nativeEnum(TransactionCategory, { required_error: 'Category is required' }),
  date: z.string().optional().transform(v => v ? new Date(v) : new Date()),
});
