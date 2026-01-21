import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';
import * as AlumniService from './alumni.service';
import { uploadToCloudinary } from '@/utils/cloudinary.util';

export const getAllAlumni = asyncHandler(async (req: Request, res: Response) => {
  const result = await AlumniService.getAllAlumni(req.query);
  
  successResponse(res, result, 'Alumni fetched successfully');
});

export const getAlumniById = asyncHandler(async (req: Request, res: Response) => {
  const alumni = await AlumniService.getAlumniById(req.params.id as string);
  
  successResponse(res, alumni, 'Alumni fetched successfully');
});

export const createAlumni = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  // Handle profile image upload
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file, 'alumni');
    data.profileImage = uploadResult.secure_url;
  }

  const alumni = await AlumniService.createAlumni(data);
  
  successResponse(res, alumni, 'Alumni created successfully', 201);
});

export const updateAlumni = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  // Handle profile image upload
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file, 'alumni');
    data.profileImage = uploadResult.secure_url;
  }

  const alumni = await AlumniService.updateAlumni(req.params.id as string, data);
  
  successResponse(res, alumni, 'Alumni updated successfully');
});

export const deleteAlumni = asyncHandler(async (req: Request, res: Response) => {
  await AlumniService.deleteAlumni(req.params.id as string);
  
  successResponse(res, null, 'Alumni deleted successfully');
});
