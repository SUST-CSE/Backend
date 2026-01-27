import { z } from 'zod';
import { WorkPriority, WorkStatus, WorkVisibility } from './work-assignment.types';

export const createAssignmentSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  assignedTo: z.string({ required_error: 'Assigned user ID is required' }),
  society: z.string({ required_error: 'Society ID is required' }),
  deadline: z.string({ required_error: 'Deadline is required' }),
  priority: z.nativeEnum(WorkPriority).optional(),
  visibility: z.nativeEnum(WorkVisibility).optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(WorkStatus, { required_error: 'Status is required' }),
  feedback: z.string().optional(),
});
