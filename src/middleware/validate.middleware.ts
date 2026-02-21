import { NextFunction, Request, Response } from 'express';
import { Schema } from 'zod';
import { ValidationError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler.util';

export const validate = (schema: Schema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log(`🔍 [Validate] Checking body for ${req.method} ${req.originalUrl}`);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body Keys:', Object.keys(req.body || {}));

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
