import { z } from 'zod';
import { ApplicationStatus, ApplicationType } from './application.types';

export const submitApplicationSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  type: z.nativeEnum(ApplicationType, { required_error: 'Application type is required' }),
  attachments: z.array(z.string()).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, { required_error: 'Status is required' }),
  feedback: z.string().optional(),
});
