import { Document, Schema } from 'mongoose';

export enum BlogStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export interface IBlog extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  category: string;
  status: BlogStatus;
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
