import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import * as ApplicationService from './application.service';

export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { submissionMode, textContent, ...otherData } = req.body;
  let fileUrls: string[] = [];

  if (req.file) {
    const { secure_url } = await uploadToCloudinary(req.file, 'sust-cse/applications');
    fileUrls = [secure_url];
  }

  const result = await ApplicationService.submitApplication({
    ...otherData,
    submissionMode: submissionMode || (req.file ? 'PDF' : 'TEXT'),
    textContent,
    submittedBy: userId,
    attachments: fileUrls,
  });
  successResponse(res, result, 'Application submitted successfully', 201);
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ApplicationService.getMyApplications(userId);
  successResponse(res, result, 'Your applications fetched successfully');
});

export const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ApplicationService.getAllApplications(req.query, user);
  successResponse(res, result, 'Applications fetched successfully');
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ApplicationService.getApplicationById(id as string);
  successResponse(res, result, 'Application fetched successfully');
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, feedback, l0Reviewer, medium, to } = req.body;
  const result = await ApplicationService.updateApplicationStatus(id as string, { status, feedback, l0Reviewer, medium, to });
  successResponse(res, result, `Application updated successfully`);
});

export const approveStage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stage, status, feedback } = req.body;
  const reviewerId = (req as any).user._id;

  const result = await ApplicationService.approveApplicationStage(
    id as string,
    stage,
    reviewerId,
    status,
    feedback
  );
  successResponse(res, result, `Stage ${stage} ${status.toLowerCase()} successfully`);
});
