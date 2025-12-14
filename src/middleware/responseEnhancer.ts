import type { NextFunction, Request, Response } from 'express';

export const responseEnhancer = (req: Request, res: Response, next: NextFunction) => {
  res.success = <T = unknown>(data: T, message?: string, statusCode: number = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
      },
    });
  };
  next();
};
