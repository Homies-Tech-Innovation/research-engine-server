import { redisFromEnv } from './utils/redisClient';

// TODO: check duplication support
export const connections = {
  // Rate limiter connection
  redisRateLimiter: redisFromEnv('REDIS_RATE_LIMITER'),
  socketPubClient: redisFromEnv('REDIS_SOCKET_PUB_SUB'),
  socketSubClient: redisFromEnv('REDIS_SOCKET_PUB_SUB'),
} as const;
