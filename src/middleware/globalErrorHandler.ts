import { config } from '@config';
import { error, logger } from '@utils';
import type { NextFunction, Request, Response } from 'express';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Generic fallback
  let statusCode = 500;
  let message = 'Something went wrong';
  let code = 'INTERNAL_SERVER_ERROR';
  let errData: unknown;
  let stack: string | undefined;
  const requestId = req.id;

  // Hydrate with AppError Data
  if (err instanceof error.core.AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errData = err.details;
  }

  // Add stack and unsafe message (if backend error) for Dev env
  if (err instanceof Error && config.env.NODE_ENV === 'development') {
    stack = err.stack;
    message = err.message;
  }

  // Log for crashes
  if (statusCode === 500) {
    logger.error(err, `✘ Error occurred while processing request\n`);
  }

  // Send final response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: errData,
      stack,
    },
    meta: {
      requestId: requestId,
      timestamp: new Date().toISOString(),
    },
  });
};
