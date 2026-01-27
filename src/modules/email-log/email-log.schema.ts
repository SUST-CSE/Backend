import { Schema, model } from 'mongoose';

export interface IEmailLog {
  recipient: string;
  subject: string;
  type: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  sentAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
    error: String,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EmailLog = model<IEmailLog>('EmailLog', emailLogSchema as any);
