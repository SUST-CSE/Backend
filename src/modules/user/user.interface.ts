import { Model, Types } from 'mongoose';
import { UserRole, UserStatus } from './user.types';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  profileImage?: string;
  phone: string;
  status: UserStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends IUser {
  studentId: string;
  batch: string;
  session: string;
  cgpa?: number;
  enrollmentYear: number;
}

export interface ITeacher extends IUser {
  designation: string;
  department: string;
  researchInterests: string[];
  publications: string[];
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
export type StudentModel = Model<IStudent, {}, IUserMethods>;
export type TeacherModel = Model<ITeacher, {}, IUserMethods>;
