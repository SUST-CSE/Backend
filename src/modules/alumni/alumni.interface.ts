import { Model, Types } from 'mongoose';

export interface IAlumni {
  _id: Types.ObjectId;
  name: string;
  batch: string;
  currentCompany: string;
  currentPosition: string;
  previousCompanies: string[];
  profileImage: string;
  description: string;
  quotes: string;
  linkedIn?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AlumniModel = Model<IAlumni>;
