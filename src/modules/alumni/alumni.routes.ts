import { Router, Request, Response } from 'express';
import * as AlumniController from './alumni.controller';
import { auth } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createAlumniSchema, updateAlumniSchema } from './alumni.validator';
import { UserRole } from '../../modules/user/user.types';

const router = Router();

// Public routes
router.post(
  '/graduate-session',
  auth(UserRole.ADMIN),
  AlumniController.graduateSession
);

router.get('/:id', AlumniController.getAlumniById);

router.post(
  '/',
  auth(UserRole.ADMIN),
  upload.single('profileImage'),
  validate(createAlumniSchema),
  AlumniController.createAlumni
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN),
  upload.single('profileImage'),
  validate(updateAlumniSchema),
  AlumniController.updateAlumni
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN),
  AlumniController.deleteAlumni
);

router.post(
  '/add-from-user',
  auth(UserRole.ADMIN),
  AlumniController.addAlumniFromUser
);

router.get('/', AlumniController.getAllAlumni);

export const AlumniRoutes = router;
