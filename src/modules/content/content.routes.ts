import express from 'express';
import * as ContentController from './content.controller';
import { validate } from '@/middleware/validate.middleware';
import { homePageSchema, noticeSchema, achievementSchema } from './content.validator';
import { auth } from '@/middleware/auth.middleware';
import { UserRole } from '@/modules/user/user.types';
import { upload } from '@/middleware/upload.middleware';

const router = express.Router();

// HomePage
router.get('/homepage', ContentController.getHomePage);
router.put(
  '/homepage',
  auth(UserRole.ADMIN),
  upload.single('heroImage'),
  validate(homePageSchema),
  ContentController.updateHomePage
);

// Notices
router.get('/notices', ContentController.getNotices);
router.get('/notices/:id', ContentController.getNoticeById);
router.post(
  '/notices',
  auth(UserRole.ADMIN),
  upload.array('attachments', 5),
  validate(noticeSchema),
  ContentController.createNotice
);
router.delete(
  '/notices/:id',
  auth(UserRole.ADMIN),
  ContentController.deleteNotice
);

// Achievements
router.get('/achievements', ContentController.getAchievements);
router.post(
  '/achievements',
  auth(UserRole.ADMIN, UserRole.TEACHER),
  upload.array('images', 5),
  validate(achievementSchema),
  ContentController.createAchievement
);
router.delete(
  '/achievements/:id',
  auth(UserRole.ADMIN),
  ContentController.deleteAchievement
);

export const ContentRoutes = router;
