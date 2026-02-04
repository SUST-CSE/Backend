import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as CostService from './cost.service';
import { ICostRequest } from './cost.interface';

export const createCostRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await CostService.createCostRequest(
    req.body, 
    (req.files as Express.Multer.File[]) || [], 
    (req as any).user._id as string
  );

  successResponse(res, result, 'Cost request submitted successfully', 201);
});

export const getMyCostRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await CostService.getMyCostRequests((req as any).user._id as string);
  successResponse(res, result, 'My cost requests fetched successfully');
});

export const getPendingApprovals = asyncHandler(async (req: Request, res: Response) => {
  const permissions = (req as any).user.permissions || [];
  let result: ICostRequest[] = [];
  
  if (permissions.includes('APPROVE_COST_FINAL')) {
    const final = await CostService.getPendingApprovals('APPROVE_COST_FINAL');
    result = [...result, ...final];
  }
  if (permissions.includes('APPROVE_COST_L2')) {
    const l2 = await CostService.getPendingApprovals('APPROVE_COST_L2');
    result = [...result, ...l2];
  }
  if (permissions.includes('APPROVE_COST_L1')) {
    const l1 = await CostService.getPendingApprovals('APPROVE_COST_L1');
    result = [...result, ...l1];
  }
  
  // Deduplicate by ID
  const uniqueResult = Array.from(new Map(result.map(item => [item._id?.toString(), item])).values());

  successResponse(res, uniqueResult as any, 'Pending approvals fetched successfully');
});

export const getAllCosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await CostService.getAllCosts();
  successResponse(res, result, 'All costs fetched successfully');
});

export const approveCostRequest = asyncHandler(async (req: Request, res: Response) => {
  const permissions = ((req as any).user.permissions || []) as string[];
  const result = await CostService.approveCostRequest(
    req.params.id as string,
    (req as any).user._id as string,
    permissions,
    req.body.comment
  );
  successResponse(res, result, 'Cost request approved successfully');
});

export const rejectCostRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await CostService.rejectCostRequest(
    req.params.id as string,
    (req as any).user._id as string,
    req.body.reason
  );
  successResponse(res, result, 'Cost request rejected successfully');
});

export const addCheckNumber = asyncHandler(async (req: Request, res: Response) => {
  const result = await CostService.addCheckNumber(
    req.params.id as string,
    req.body.checkNumber,
    (req as any).user._id as string
  );
  successResponse(res, result, 'Check number added successfully');
});

export const syncApprovedCosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await CostService.syncApprovedCostsToFinance(userId as string);
  successResponse(res, result, `Successfully synced ${result.syncedCount} records to finance`);
});
