import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { AppError } from '../../utils/errors';
import * as FinanceService from './finance.service';

export const addTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const proofUrls: string[] = [];
  let proofType = '';

  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const { secure_url, format } = await uploadToCloudinary(file, 'sust-cse/finance');
      proofUrls.push(secure_url);
      if (!proofType) proofType = format === 'pdf' ? 'pdf' : 'image';
    }
  }

  // Handle amount if it comes as string from FormData
  const amount = typeof req.body.amount === 'string' ? Number(req.body.amount) : req.body.amount;

  const result = await FinanceService.addTransaction({
    ...req.body,
    amount,
    addedBy: userId,
    proofUrls,
    proofType,
  });
  successResponse(res, result, 'Transaction added successfully', 201);
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const result = await FinanceService.getTransactions(req.query);
  successResponse(res, result, 'Transactions fetched successfully');
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await FinanceService.getFinancialSummary();
  successResponse(res, result, 'Financial summary fetched successfully');
});

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await FinanceService.deleteTransaction(id as string);
  successResponse(res, null, 'Transaction deleted successfully');
});
