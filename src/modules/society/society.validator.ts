import { z } from 'zod';
import { MemberDesignation, SocietyCategory } from './society.types';

export const createSocietySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  foundedDate: z.string().min(1, 'Founded date is required'),
  category: z.nativeEnum(SocietyCategory),
  socialLinks: z.object({
    facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  }).optional(),
});

export const addMemberSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  designation: z.nativeEnum(MemberDesignation),
  tenureStart: z.string().min(1, 'Tenure start date is required'),
  tenureEnd: z.string().optional().or(z.literal('')),
  isCurrent: z.union([z.boolean(), z.string()])
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val === true;
    })
    .default(true),
  achievements: z.array(z.string()).optional(),
  session: z.string().min(1, 'Session is required'), // Added session to match updated requirements
});

export const updateSocietySchema = createSocietySchema.partial();
export const updateMemberSchema = addMemberSchema.partial();
