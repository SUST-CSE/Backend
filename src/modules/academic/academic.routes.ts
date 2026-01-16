import express from 'express';
import * as AcademicController from './academic.controller';
import { validate } from '@/middleware/validate.middleware';
import { createCourseSchema, updateCourseSchema, createAcademicAchievementSchema, createStatSchema } from './academic.validator';
import { auth } from '@/middleware/auth.middleware';
import { UserRole } from '@/modules/user/user.types';
import { upload } from '@/middleware/upload.middleware';

const router = express.Router();

// Courses
router.get('/courses', AcademicController.getCourses);
router.post(
  '/courses',
  auth(UserRole.ADMIN),
  validate(createCourseSchema),
  AcademicController.createCourse
);
router.patch(
  '/courses/:id',
  auth(UserRole.ADMIN),
  validate(updateCourseSchema),
  AcademicController.updateCourse
);
router.delete(
  '/courses/:id',
  auth(UserRole.ADMIN),
  AcademicController.deleteCourse
);

// Achievements
router.get('/achievements', AcademicController.getAchievements);
router.post(
  '/achievements',
  auth(UserRole.ADMIN, UserRole.TEACHER),
  upload.array('attachments', 5),
  validate(createAcademicAchievementSchema),
  AcademicController.createAchievement
);

// Stats
router.get('/stats', AcademicController.getStats);
router.post(
  '/stats',
  auth(UserRole.ADMIN),
  validate(createStatSchema),
  AcademicController.updateStat
);

export const AcademicRoutes = router;
