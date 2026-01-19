import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';
import * as AuthService from './auth.service';

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
