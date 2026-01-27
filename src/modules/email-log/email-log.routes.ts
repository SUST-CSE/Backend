import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { EmailLog } from './email-log.schema';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../user/user.types';

import { UserPermission } from '../user/user.interface';

const router = express.Router();

router.get(
  '/',
  auth([UserRole.ADMIN], [UserPermission.VIEW_EMAIL_LOGS]),
  asyncHandler(async (req: Request, res: Response) => {
    const logs = await EmailLog.find().sort({ sentAt: -1 }).limit(100);
    successResponse(res, logs, 'Email logs fetched successfully');
  })
);

export const EmailLogRoutes = router;
