import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { UserRole } from '../user/user.types';

export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.registerStudent(req.body);
  
  successResponse(res, result, 'Student registered successfully', 201);
});

export const registerTeacher = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.registerTeacher(req.body);
  
  successResponse(res, result, 'Teacher registered successfully', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  
  successResponse(res, result, 'User logged in successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  successResponse(res, user, 'User profile fetched successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  successResponse(res, null, 'User logged out successfully');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const result = await AuthService.verifyEmail(email, code);
  
  successResponse(res, result, 'Email verified successfully');
});

export const resendCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.resendVerificationCode(email);
  
  successResponse(res, result, 'Verification code sent successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  successResponse(res, result, 'Reset code sent successfully');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  successResponse(res, result, 'Password reset successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await AuthService.changePassword(userId, req.body);
  successResponse(res, result, 'Password updated successfully');
});
