import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors/AppError';
import { env } from '@/config/env';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    console.error(`❌ [${err.statusCode}] ${err.message}`);
    if (err.statusCode === 400) console.error('Details:', err);
    
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production mode
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    } else {
      // Programming or other unknown error
      console.error('ERROR 💥', err);
      res.status(500).json({
        success: false,
        message: 'Something went very wrong!',
      });
    }
  }
};
