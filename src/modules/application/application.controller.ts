import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as ApplicationService from './application.service';

export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ApplicationService.submitApplication({
    ...req.body,
    submittedBy: userId,
  });
  successResponse(res, result, 'Application submitted successfully', 201);
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ApplicationService.getMyApplications(userId);
  successResponse(res, result, 'Your applications fetched successfully');
});

export const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await ApplicationService.getAllApplications(req.query);
  successResponse(res, result, 'Applications fetched successfully');
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ApplicationService.getApplicationById(id as string);
  successResponse(res, result, 'Application fetched successfully');
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, feedback } = req.body;
  const result = await ApplicationService.updateApplicationStatus(id as string, status, feedback);
  successResponse(res, result, `Application ${status.toLowerCase()} successfully`);
});
