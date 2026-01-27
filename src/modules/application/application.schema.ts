import { Schema, model } from 'mongoose';
import { IApplication } from './application.interface';
import { ApplicationStatus, ApplicationType } from './application.types';

const applicationSchema = new Schema<IApplication>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: Object.values(ApplicationType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    attachments: [String],
    feedback: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-find hook to filter out deleted applications
applicationSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const Application = model<IApplication>('Application', applicationSchema as any);
