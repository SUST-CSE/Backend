import express from 'express';
import * as ContentController from './content.controller';
import { validate } from '../../middleware/validate.middleware';
import { homePageSchema, noticeSchema, achievementSchema } from './content.validator';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../modules/user/user.types';
import { upload } from '../../middleware/upload.middleware';
import { UserPermission } from '../user/user.interface';

const router = express.Router();

// HomePage
router.get('/homepage', ContentController.getHomePage);
router.put(
  '/homepage',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_CONTENT]),
  upload.array('heroImages', 5),
  validate(homePageSchema),
  ContentController.updateHomePage
);

// Notices
router.get('/notices', ContentController.getNotices);
router.get('/notices/:id', ContentController.getNoticeById);
router.post(
  '/notices',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER], [UserPermission.MANAGE_NOTICES]),
  upload.array('attachments', 5),
  validate(noticeSchema),
  ContentController.createNotice
);
router.patch(
  '/notices/:id',
  auth([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER], [UserPermission.MANAGE_NOTICES]),
  upload.array('attachments', 5),
  ContentController.updateNotice
);
router.delete(
  '/notices/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_NOTICES, UserPermission.MANAGE_CONTENT]),
  ContentController.deleteNotice
);

// Achievements
router.get('/achievements', ContentController.getAchievements);
router.get('/achievements/:id', ContentController.getAchievementById);
router.post(
  '/achievements',
  auth([UserRole.ADMIN, UserRole.TEACHER], [UserPermission.MANAGE_ACHIEVEMENTS]),
  upload.array('images', 5),
  validate(achievementSchema),
  ContentController.createAchievement
);
router.delete(
  '/achievements/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_ACHIEVEMENTS, UserPermission.MANAGE_CONTENT]),
  ContentController.deleteAchievement
);

router.post('/send-message', auth(UserRole.ADMIN), ContentController.sendMessage);

// Important Data
router.get('/important-data', ContentController.getImportantData);
router.post(
  '/important-data',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_IMPORTANT_DATA]),
  upload.array('files', 10),
  ContentController.createImportantData
);
router.delete(
  '/important-data/:id',
  auth([UserRole.ADMIN], [UserPermission.MANAGE_IMPORTANT_DATA]),
  ContentController.deleteImportantData
);

export const ContentRoutes = router;
