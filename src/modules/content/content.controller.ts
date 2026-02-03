import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as ContentService from './content.service';
import { User } from '../user/user.schema';
import { UserRole } from '../user/user.types';
import { sendEmail } from '../../utils/email.util';

// HomePage
export const getHomePage = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getHomePage();
  successResponse(res, result, 'Homepage data fetched successfully');
});

export const updateHomePage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ContentService.updateHomePage(req.body, req.files as Express.Multer.File[], userId);
  successResponse(res, result, 'Homepage updated successfully');
});

// Notices
export const createNotice = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const notice = await ContentService.createNotice(req.body, (req.files as Express.Multer.File[]) || [], userId);
  
  successResponse(res, notice, 'Notice created successfully', 201);
});

export const getNotices = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getAllNotices(req.query);
  successResponse(res, result, 'Notices fetched successfully');
});

export const getNoticeById = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getNoticeById(req.params.id as string);
  successResponse(res, result, 'Notice details fetched successfully');
});

export const updateNotice = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.updateNotice(
    req.params.id as string,
    req.body,
    (req.files as Express.Multer.File[]) || [],
    (req as any).user._id
  );
  successResponse(res, result, 'Notice updated successfully');
});

export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  await ContentService.deleteNotice(req.params.id as string);
  successResponse(res, null, 'Notice deleted successfully');
});

// Achievements
export const createAchievement = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ContentService.createAchievement(req.body, (req.files as Express.Multer.File[]) || [], userId);
  successResponse(res, result, 'Achievement created successfully', 201);
});

export const getAchievements = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getAllAchievements(req.query);
  successResponse(res, result, 'Achievements fetched successfully');
});

export const deleteAchievement = asyncHandler(async (req: Request, res: Response) => {
  await ContentService.deleteAchievement(req.params.id as string);
  successResponse(res, null, 'Achievement deleted successfully');
});

export const getAchievementById = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getAchievementById(req.params.id as string);
  successResponse(res, result, 'Achievement details fetched successfully');
});

// Admin Messenger
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { title, content, target, methods } = req.body;
  
  const result = await ContentService.sendMessage({ title, content, target, methods }, userId);
  successResponse(res, result, 'Message process completed');
});

// Important Data
export const createImportantData = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ContentService.createImportantData(req.body, (req.files as Express.Multer.File[]) || [], userId);
  successResponse(res, result, 'Data uploaded successfully', 201);
});

export const getImportantData = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getAllImportantData();
  successResponse(res, result, 'Important Data fetched successfully');
});

export const deleteImportantData = asyncHandler(async (req: Request, res: Response) => {
  await ContentService.deleteImportantData(req.params.id as string);
  successResponse(res, null, 'Data deleted successfully');
});
