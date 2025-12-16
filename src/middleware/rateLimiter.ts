import { config } from '@config';
import { connections } from '@redis';
import { error, logger } from '@utils';
import type { NextFunction, Request, Response } from 'express';
import { RateLimiterRedis, type RateLimiterRes } from 'rate-limiter-flexible';

// Rate limiter for non-authenticated user
const ipLimiter = new RateLimiterRedis({
  storeClient: connections.redisRateLimiter,
  keyPrefix: 'ip_limit',
  points: config.env.RATE_LIMIT_GUEST_MAX_REQUESTS,
  duration: config.env.RATE_LIMIT_GUEST_WINDOW_SECONDS,
});

// Rate limiter for authenticated user
const userLimiter = new RateLimiterRedis({
  storeClient: connections.redisRateLimiter,
  keyPrefix: 'user_limit',
  points: config.env.RATE_LIMIT_AUTH_MAX_REQUESTS,
  duration: config.env.RATE_LIMIT_AUTH_WINDOW_SECONDS,
});

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const isAuth = !!req.user;
  const limiter = isAuth ? userLimiter : ipLimiter;

  const key = isAuth ? req.user.id : req.ip || 'unknown_ip';
  try {
    await limiter.consume(key);
    next();
  } catch (err) {
    const rateLimiterRes = err as RateLimiterRes;
    logger.warn(`Rate Limit Exceeded: ${key}`);
    res.set({
      'Retry-After': rateLimiterRes.msBeforeNext / 1000,
      'X-RateLimit-Limit': isAuth
        ? config.env.RATE_LIMIT_AUTH_MAX_REQUESTS
        : config.env.RATE_LIMIT_GUEST_MAX_REQUESTS,
      'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
    });
    throw new error.core.AppError('Too many requests. Please slow down.', 429, 'TOO_MANY_REQUESTS');
  }
};
