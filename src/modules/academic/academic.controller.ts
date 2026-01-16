import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';
import * as AcademicService from './academic.service';

// Courses
export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await AcademicService.createCourse(req.body);
  successResponse(res, result, 'Course created successfully', 201);
});

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const result = await AcademicService.getAllCourses(req.query);
  successResponse(res, result, 'Courses fetched successfully');
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await AcademicService.updateCourse(req.params.id as string, req.body);
  successResponse(res, result, 'Course updated successfully');
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  await AcademicService.deleteCourse(req.params.id as string);
  successResponse(res, null, 'Course deleted successfully');
});

// Achievements
export const createAchievement = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await AcademicService.createAchievement(req.body, (req.files as Express.Multer.File[]) || [], userId);
  successResponse(res, result, 'Academic achievement created successfully', 201);
});

export const getAchievements = asyncHandler(async (req: Request, res: Response) => {
  const result = await AcademicService.getAllAchievements(req.query);
  successResponse(res, result, 'Academic achievements fetched successfully');
});

// Stats
export const updateStat = asyncHandler(async (req: Request, res: Response) => {
  const result = await AcademicService.updateStat(req.body);
  successResponse(res, result, 'Academic statistic updated successfully');
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await AcademicService.getStats();
  successResponse(res, result, 'Academic statistics fetched successfully');
});
