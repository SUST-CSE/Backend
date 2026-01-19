import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';
import { User } from './user.schema';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { email, role, limit = 10, page = 1 } = req.query;
  const filter: any = { isDeleted: false };

  if (email) {
    filter.email = { $regex: email, $options: 'i' };
  }
  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select('name email role profileImage studentId') // Select limited fields
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  successResponse(res, users, 'Users fetched successfully');
});
