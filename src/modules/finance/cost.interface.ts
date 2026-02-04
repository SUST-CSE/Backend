import { Types } from 'mongoose';

export enum CostStatus {
  PENDING = 'PENDING',
  APPROVED_L1 = 'APPROVED_L1', // General Secretary Approved
  APPROVED_L2 = 'APPROVED_L2', // Treasurer Approved
  APPROVED_FINAL = 'APPROVED_FINAL', // Admin/Head Approved (Ready for Check)
  REJECTED = 'REJECTED',
}

export interface IApprovalInfo {
  approvedBy: Types.ObjectId;
  approvedAt: Date;
  comment?: string;
}

export interface ICostRequest {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  amount: number;
  
  // Attachments (Images/PDFs)
  attachments: string[];
  
  status: CostStatus;
  
  // Approval Flow
  approvedByL1?: IApprovalInfo;
  approvedByL2?: IApprovalInfo;
  approvedByFinal?: IApprovalInfo;
  
  // Rejection
  rejectedBy?: {
    user: Types.ObjectId;
    rejectedAt: Date;
    reason: string;
  };
  
  // Payment Details
  checkNumber?: string;
  checkDate?: Date;
  
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
