import { Types } from 'mongoose';
import { ApplicationStatus, ApplicationType } from './application.types';

export interface IApplication {
  _id: Types.ObjectId;
  title: string;
  description: string;
  submittedBy: Types.ObjectId; // Reference to User
  type: ApplicationType;
  status: ApplicationStatus;
  attachments?: string[];
  feedback?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
