import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as WorkAssignmentService from './work-assignment.service';
import { UserRole } from '../user/user.types';

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const adminId = user._id;

  // If user has MANAGE_WORK permission, treat as ADMIN for hierarchy bypass validation in service
  const effectiveRole = (user.role === UserRole.ADMIN || user.permissions?.includes('MANAGE_WORK')) 
    ? UserRole.ADMIN 
    : user.role;

  const result = await WorkAssignmentService.createWorkAssignment({
    ...req.body,
    assignedBy: adminId,
  }, effectiveRole);
  successResponse(res, result, 'Work assigned successfully', 201);
});

export const getMyWork = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await WorkAssignmentService.getMyAssignments(userId);
  successResponse(res, result, 'Your assignments fetched successfully');
});

export const getSocietyWork = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params;
  const user = (req as any).user;
  const isAdmin = user.role === UserRole.ADMIN;
  
  const result = await WorkAssignmentService.getAssignmentsForSociety(societyId as string, user._id, isAdmin);
  successResponse(res, result, 'Society assignments fetched successfully');
});

export const getAllWork = asyncHandler(async (req: Request, res: Response) => {
  const result = await WorkAssignmentService.getAllAssignments(req.query);
  successResponse(res, result, 'All assignments fetched successfully');
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, feedback } = req.body;
  const result = await WorkAssignmentService.updateAssignmentStatus(id as string, status, feedback);
  successResponse(res, result, 'Assignment status updated successfully');
});

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WorkAssignmentService.updateAssignment(id as string, req.body);
  successResponse(res, result, 'Assignment updated successfully');
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await WorkAssignmentService.deleteAssignment(id as string);
  successResponse(res, null, 'Assignment deleted successfully');
});
