import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as SocietyService from './society.service';

// Societies
export const createSociety = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await SocietyService.createSociety(req.body, req.file as Express.Multer.File, userId);
  successResponse(res, result, 'Society created successfully', 201);
});

export const getSocieties = asyncHandler(async (req: Request, res: Response) => {
  const result = await SocietyService.getAllSocieties(req.query);
  successResponse(res, result, 'Societies fetched successfully');
});

export const getSocietyById = asyncHandler(async (req: Request, res: Response) => {
  const result = await SocietyService.getSocietyById(req.params.id as string);
  successResponse(res, result, 'Society details fetched successfully');
});

export const updateSociety = asyncHandler(async (req: Request, res: Response) => {
  const result = await SocietyService.updateSociety(req.params.id as string, req.body, req.file as Express.Multer.File | undefined);
  successResponse(res, result, 'Society updated successfully');
});

// Members
export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params; // Extract id from params
  const { session, ...restBody } = req.body; // Extract session and rest of body
  const result = await SocietyService.addMember(
    id as string,
    {
      ...restBody,
      user: req.body.user,
      session: session
    },
    req.file, // Pass the file object correctly
    userId
  );
  successResponse(res, result, 'Member added successfully', 201);
});

export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await SocietyService.getSocietyMembers(req.params.id as string, req.query);
  successResponse(res, result, 'Society members fetched successfully');
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const result = await SocietyService.updateMember(req.params.memberId as string, req.body);
  successResponse(res, result, 'Member record updated successfully');
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await SocietyService.removeMember(req.params.memberId as string);
  successResponse(res, null, 'Member removed successfully');
});
