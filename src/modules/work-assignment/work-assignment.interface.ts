import { Types } from 'mongoose';
import { WorkPriority, WorkStatus, WorkVisibility } from './work-assignment.types';

export interface IWorkAssignment {
  _id: Types.ObjectId;
  title: string;
  description: string;
  assignedTo: Types.ObjectId; // Reference to User
  assignedBy: Types.ObjectId; // Reference to User (Admin/Assigner)
  society: Types.ObjectId;    // Reference to Society
  deadline: Date;
  status: WorkStatus;
  priority: WorkPriority;
  visibility: WorkVisibility;
  attachments?: string[];
  feedback?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
