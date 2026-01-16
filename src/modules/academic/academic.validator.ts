import { z } from 'zod';
import { AcademicLevel, AchievementType, CourseType } from './academic.types';

export const createCourseSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Title is required'),
  credits: z.number().positive(),
  type: z.nativeEnum(CourseType),
  level: z.nativeEnum(AcademicLevel),
  semester: z.number().int().min(1).max(12),
  syllabusUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().min(1, 'Description is required'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createAcademicAchievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.nativeEnum(AchievementType),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  user: z.string().optional(),
});

export const updateAcademicAchievementSchema = createAcademicAchievementSchema.partial();

export const createStatSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  icon: z.string().optional(),
  category: z.enum(['RESEARCH', 'STUDENT', 'FACULTY', 'ALUMNI']),
});
