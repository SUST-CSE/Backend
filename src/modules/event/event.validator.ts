import { z } from 'zod';
import { EventCategory } from './event.types';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(1, 'Location is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  category: z.nativeEnum(EventCategory),
  registrationLink: z.string().url('Invalid URL').optional(),
  maxParticipants: z.number().int().positive().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateEventSchema = createEventSchema.partial();
