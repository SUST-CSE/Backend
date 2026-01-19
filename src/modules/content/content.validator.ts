import { z } from 'zod';
import { AchievementCategory, NoticeCategory } from './content.types';

export const homePageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
});

export const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  publishDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isPinned: z.union([z.boolean(), z.string()])
    .transform((val) => val === 'true' || val === true)
    .optional(),
  category: z.nativeEnum(NoticeCategory),
});

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  achievedBy: z.string().min(1, 'Achiever ID is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.nativeEnum(AchievementCategory),
});
