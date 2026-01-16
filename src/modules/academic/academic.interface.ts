import { Types } from 'mongoose';
import { AcademicLevel, AchievementType, CourseType } from './academic.types';

export interface ICourse {
  _id: Types.ObjectId;
  courseCode: string;
  title: string;
  credits: number;
  type: CourseType;
  level: AcademicLevel;
  semester: number;
  syllabusUrl?: string;
  description: string;
  isDeleted: boolean;
}

export interface IAcademicAchievement {
  _id: Types.ObjectId;
  title: string;
  type: AchievementType;
  description: string;
  date: Date;
  attachments: string[];
  user?: Types.ObjectId; // Reference to Student or Teacher
  createdBy: Types.ObjectId;
  isDeleted: boolean;
}

export interface IAcademicStat {
  _id: Types.ObjectId;
  label: string;
  value: string;
  icon?: string;
  category: 'RESEARCH' | 'STUDENT' | 'FACULTY' | 'ALUMNI';
  isDeleted: boolean;
}
