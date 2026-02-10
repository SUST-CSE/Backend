import { z } from 'zod';
import { ApplicationStatus, ApplicationType } from './application.types';

export const submitApplicationSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  type: z.nativeEnum(ApplicationType, { required_error: 'Application type is required' }),
  attachments: z.array(z.string()).optional(),
  medium: z.string().optional(),
  to: z.string({ required_error: 'Recipient (To) is required' }),
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
