import { z } from 'zod';
import { AchievementCategory, NoticeCategory, TargetAudience } from './content.types';

export const homePageSchema = z.object({
  heroSlides: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    description: z.string().min(1, 'Description is required'),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    image: z.string().optional(),
  })).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  editSlideIndex: z.string().optional(),
  deleteSlideIndex: z.string().optional(),
});

export const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  publishDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isPinned: z.union([z.boolean(), z.string()])
    .transform((val) => val === 'true' || val === true)
    .optional(),
  isImportant: z.union([z.boolean(), z.string()])
    .transform((val) => val === 'true' || val === true)
    .optional(),
  shouldSendEmail: z.union([z.boolean(), z.string()])
    .transform((val) => val === 'true' || val === true)
    .optional(),
  targetAudience: z.nativeEnum(TargetAudience).optional(),
  category: z.nativeEnum(NoticeCategory),
});

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  teamName: z.string().optional(),
  competitionName: z.string().min(1, 'Competition name is required'),
  position: z.string().min(1, 'Position is required'),
  achievedBy: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  category: z.nativeEnum(AchievementCategory),
});
