import { Model, Types } from 'mongoose';
import { UserRole, UserStatus } from './user.types';

export enum UserPermission {
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CONTENT = 'MANAGE_CONTENT',
  MANAGE_SOCIETIES = 'MANAGE_SOCIETIES',
  MANAGE_APPLICATIONS = 'MANAGE_APPLICATIONS',
  VIEW_EMAIL_LOGS = 'VIEW_EMAIL_LOGS',
  MANAGE_ACCOUNTS = 'MANAGE_ACCOUNTS',
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions: UserPermission[];
  profileImage?: string;
  phone: string;
  status: UserStatus;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  isDeleted: boolean;
  notificationPreferences?: {
    notices: string[];
    events: string[];
  };
  socialLinks?: {
    facebook?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  experiences?: {
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }[];
  researches?: {
    title: string;
    publicationLink?: string;
    journal?: string;
    publicationDate?: Date;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends IUser {
  studentId: string;
  batch: string;
  session: string;
  cgpa?: number;
  enrollmentYear: number;
  projectLinks?: { // Deprecated, keeping for backward compat if needed, or remove? Plan said "Change".
    github?: string;
    liveLink?: string;
  };
  projects?: {
    title: string;
    description: string;
    githubLink?: string;
    liveLink?: string;
    technologies?: string[];
  }[];
  isAlumni: boolean;
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
