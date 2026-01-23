import { Schema, model } from 'mongoose';
import { IAlumni, AlumniModel } from './alumni.interface';

const alumniSchema = new Schema<IAlumni, AlumniModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
    },
    currentCompany: {
      type: String,
      required: [true, 'Current company is required'],
      trim: true,
    },
    currentPosition: {
      type: String,
      required: [true, 'Current position is required'],
      trim: true,
    },
    previousCompanies: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      required: [true, 'Profile image is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    quotes: {
      type: String,
      required: [true, 'Quotes are required'],
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    facebook: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Alumni = model<IAlumni, AlumniModel>('Alumni', alumniSchema);
