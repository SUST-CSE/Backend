import { z } from 'zod';

export const createAlumniSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  batch: z.string().min(1, 'Batch is required'),
  currentCompany: z.string().min(1, 'Current company is required'),
  currentPosition: z.string().min(1, 'Current position is required'),
  previousCompanies: z.array(z.string()).optional().default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  quotes: z.string().min(5, 'Quotes must be at least 5 characters'),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional(),
  facebook: z.string().url('Invalid Facebook URL').optional(),
  instagram: z.string().url('Invalid Instagram URL').optional(),
  website: z.string().url('Invalid Website URL').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const updateAlumniSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  batch: z.string().min(1, 'Batch is required').optional(),
  currentCompany: z.string().min(1, 'Current company is required').optional(),
  currentPosition: z.string().min(1, 'Current position is required').optional(),
  previousCompanies: z.array(z.string()).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  quotes: z.string().min(5, 'Quotes must be at least 5 characters').optional(),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional(),
  facebook: z.string().url('Invalid Facebook URL').optional(),
  instagram: z.string().url('Invalid Instagram URL').optional(),
  website: z.string().url('Invalid Website URL').optional(),
  email: z.string().email('Invalid email address').optional(),
});
