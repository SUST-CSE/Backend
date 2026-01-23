import express from 'express';
import * as AuthController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import * as AuthValidator from './auth.validator';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();
console.log('✅ Auth Routes Module Loaded');

router.post(
  '/register/student',
  validate(AuthValidator.registerStudentSchema),
  AuthController.registerStudent
);

router.post(
  '/register/teacher',
  validate(AuthValidator.registerTeacherSchema),
  AuthController.registerTeacher
);

router.post(
  '/login',
  validate(AuthValidator.loginSchema),
  AuthController.login
);

router.post(
  '/verify-email',
  validate(AuthValidator.verifyEmailSchema),
  AuthController.verifyEmail
);

router.post(
  '/resend-code',
  validate(AuthValidator.resendCodeSchema),
  AuthController.resendCode
);

router.get(
  '/me',
  auth(),
  AuthController.getMe
);

router.post(
  '/logout',
  AuthController.logout
);

router.post(
  '/forgot-password',
  validate(AuthValidator.forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validate(AuthValidator.resetPasswordSchema),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  auth(),
  validate(AuthValidator.changePasswordSchema),
  AuthController.changePassword
);

export const AuthRoutes = router;
