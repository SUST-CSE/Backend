import { z } from 'zod';
import { UserRole } from '@/modules/user/user.types';

export const registerBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'Invalid Bangladesh phone number'),
});

export const registerStudentSchema = registerBaseSchema.extend({
  studentId: z.string().min(5, 'Student ID is required'),
  batch: z.string().min(1, 'Batch is required'),
  session: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid session format (e.g., 2020-21)'),
  enrollmentYear: z.number().int().min(2000),
});

export const registerTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').refine(
    (email) => email.endsWith('@gmail.com'),
    'Teachers must use a Gmail address'
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'Invalid Bangladesh phone number'),
  designation: z.string().min(2, 'Designation is required'),
  researchInterests: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
