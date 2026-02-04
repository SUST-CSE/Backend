import { Schema, model } from 'mongoose';
import { CostStatus, ICostRequest } from './cost.interface';

const approvalSchema = new Schema({
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedAt: { type: Date, default: Date.now },
  comment: { type: String }
}, { _id: false });

const costRequestSchema = new Schema<ICostRequest>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  
  attachments: [{ type: String }],
  
  status: { 
    type: String, 
    enum: Object.values(CostStatus), 
    default: CostStatus.PENDING 
  },
  
  approvedByL1: approvalSchema,
  approvedByL2: approvalSchema,
  approvedByFinal: approvalSchema,
  
  rejectedBy: {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    reason: { type: String }
  },
  
  checkNumber: { type: String },
  checkDate: { type: Date },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export const CostRequest = model<ICostRequest>('CostRequest', costRequestSchema);
