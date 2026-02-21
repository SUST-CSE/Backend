import { z } from 'zod';
import { ApplicationStatus, ApplicationType } from './application.types';

export const submitApplicationSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  type: z.nativeEnum(ApplicationType, { required_error: 'Application type is required' }),
  submissionMode: z.enum(['PDF', 'TEXT']).optional(),
  textContent: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  medium: z.string().optional(),
  to: z.string().optional(), // Admin assigns the final approver after submission
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  feedback: z.string().optional(),
  l0Reviewer: z.string().optional(),
  medium: z.string().optional(),
  to: z.string().optional(),
});

export const approveStageSchema = z.object({
  stage: z.enum(['l0', 'l1', 'l2']),
  status: z.enum(['APPROVED', 'REJECTED']),
  feedback: z.string().optional(),
});
