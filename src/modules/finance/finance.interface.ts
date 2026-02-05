import { Types } from 'mongoose';
import { TransactionCategory, TransactionType } from './finance.types';

export interface ITransaction {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: Date;
  addedBy: Types.ObjectId; // User ref
  proofUrls?: string[];
  proofType?: string;
  relatedCostRequest?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
