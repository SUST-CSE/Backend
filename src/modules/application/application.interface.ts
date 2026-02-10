import { Types } from 'mongoose';
import { ApplicationStatus, ApplicationType } from './application.types';

export interface IApplication {
  _id: Types.ObjectId;
  title: string;
  description: string;
  submittedBy: Types.ObjectId; // Reference to User
  type: ApplicationType;
  status: ApplicationStatus;
  submissionMode: 'PDF' | 'TEXT';
  textContent?: string;
  attachments?: string[];
  signedPdfUrl?: string; // The URL of the PDF currently being modified with signatures
  feedback?: string;
  medium?: Types.ObjectId; // Optional Medium (L1)
  to: Types.ObjectId; // Required Target (L2)
  l0Reviewer?: Types.ObjectId; // Assigned by Admin
  uniqueCode?: string; // Generated on final approval
  approvalTrail: {
    l0?: { status: string; date: Date; reviewer: Types.ObjectId; feedback?: string };
    l1?: { status: string; date: Date; reviewer: Types.ObjectId; signatureUrl?: string; feedback?: string };
    l2?: { status: string; date: Date; reviewer: Types.ObjectId; signatureUrl?: string; feedback?: string };
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
