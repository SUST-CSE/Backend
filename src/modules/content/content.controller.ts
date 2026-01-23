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
  
  if (req.body.isImportant) {
    // Send email to all students and teachers
    const targetRoles = [UserRole.STUDENT, UserRole.TEACHER];
    const users = await User.find({ role: { $in: targetRoles }, isDeleted: false, status: 'ACTIVE' }).select('email');
    
    const emails = users.map(u => u.email);
    
    // Send emails
    for (const email of emails) {
      try {
        await sendEmail({
          to: email,
          subject: `IMPORTANT NOTICE: ${notice.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
              <h2 style="color: #ef4444;">Important Update</h2>
              <h3>${notice.title}</h3>
              <p>${notice.description.replace(/\n/g, '<br/>')}</p>
              <hr/>
              <p>You received this because it is marked as an important department update.</p>
            </div>
          `
        });
      } catch (err) {
        console.error(`Failed to send important notice email to ${email}`, err);
      }
    }
  }

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
