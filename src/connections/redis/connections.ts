import { redisFromEnv } from './utils/redisClient';

export const connections = {
  // Rate limiter connection
  redisRateLimiter: redisFromEnv('REDIS_RATE_LIMITER'),
} as const;
