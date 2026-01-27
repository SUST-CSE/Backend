import { Schema, model } from 'mongoose';
import { IWorkAssignment } from './work-assignment.interface';
import { WorkPriority, WorkStatus, WorkVisibility } from './work-assignment.types';

const workAssignmentSchema = new Schema<IWorkAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    society: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(WorkStatus),
      default: WorkStatus.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(WorkPriority),
      default: WorkPriority.MEDIUM,
    },
    visibility: {
      type: String,
      enum: Object.values(WorkVisibility),
      default: WorkVisibility.PUBLIC_TO_SOCIETY,
    },
    attachments: [String],
    feedback: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-find hook to filter out deleted assignments
workAssignmentSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const WorkAssignment = model<IWorkAssignment>('WorkAssignment', workAssignmentSchema);
