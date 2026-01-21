import { NextFunction, Request, Response } from 'express';
import { Schema } from 'zod';
import { ValidationError } from '@/utils/errors';
import { asyncHandler } from '@/utils/asyncHandler.util';

export const validate = (schema: Schema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.error('❌ Validation Error:', result.error.format());
      const errorMessages = result.error.issues.map(
        (issue) => `${issue.path.join('.')} : ${issue.message}`
      ).join(', ');
      throw new ValidationError(errorMessages);
    }

    req.body = result.data;
    next();
  });
};
