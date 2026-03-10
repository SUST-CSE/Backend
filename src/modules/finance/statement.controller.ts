import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { AppError } from '../../utils/errors';
import * as StatementService from './statement.service';

export const createStatement = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const documentUrls: string[] = [];

  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const { secure_url } = await uploadToCloudinary(file, 'sust-cse/finance/statements');
      documentUrls.push(secure_url);
    }
  }

  if (documentUrls.length === 0) {
    throw new AppError('At least one document is required', 400);
  }

  const result = await StatementService.createStatement({
    ...req.body,
    uploadedBy: userId,
    documentUrls,
  });

  successResponse(res, result, 'Financial statement uploaded successfully', 201);
});

export const getAllStatements = asyncHandler(async (req: Request, res: Response) => {
  const userRole = (req as any).user.role;
  // Admins see all, others see only published
  const publishedOnly = userRole !== 'ADMIN';
  const result = await StatementService.getAllStatements(publishedOnly);
  successResponse(res, result, 'Financial statements fetched successfully');
});

export const getStatementById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await StatementService.getStatementById(id);
  if (!result) throw new AppError('Statement not found', 404);
  successResponse(res, result, 'Statement fetched successfully');
});

export const updateStatement = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await StatementService.getStatementById(id);
  if (!existing) throw new AppError('Statement not found', 404);

  const documentUrls: string[] = [...(existing.documentUrls || [])];

  if (req.files && Array.isArray(req.files) && (req.files as Express.Multer.File[]).length > 0) {
    for (const file of req.files as Express.Multer.File[]) {
      const { secure_url } = await uploadToCloudinary(file, 'sust-cse/finance/statements');
      documentUrls.push(secure_url);
    }
  }

  const result = await StatementService.updateStatement(id, {
    ...req.body,
    documentUrls,
  });

  successResponse(res, result, 'Statement updated successfully');
});

export const deleteStatement = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await StatementService.deleteStatement(id);
  successResponse(res, null, 'Statement deleted successfully');
});

export const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await StatementService.getStatementById(id);
  if (!existing) throw new AppError('Statement not found', 404);

  const result = await StatementService.updateStatement(id, {
    isPublished: !existing.isPublished,
  });

  successResponse(res, result, `Statement ${result?.isPublished ? 'published' : 'unpublished'} successfully`);
});
