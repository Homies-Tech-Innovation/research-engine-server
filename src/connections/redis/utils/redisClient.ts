import { logger } from '@utils';
import Redis, { type RedisOptions } from 'ioredis';
import { getNewConfig, type RedisConfig } from './handleConfig';

export function redisFromEnv(name: string, options: Partial<RedisOptions> = {}): Redis {
  const config = getNewConfig(`${name}_URL`);

  const client = createClient(config, options);
  attachRedisEvents(name, client);

  return client;
}

// Helper functions
function createClient(config: RedisConfig, options: Partial<RedisOptions> = {}) {
  const { tls, ...connectionDetails } = config;

  const redisConfig = {
    ...connectionDetails,
    family: 4,
    keepAlive: 10000,
    connectTimeout: 10000,
    lazyConnect: true,

    // Retry strategy
    retryStrategy(times: number) {
      if (times > 10) {
        logger.error('Redis: Retry limit exhausted.');
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,

    // Fail fast
    enableOfflineQueue: false,

    // Security
    tls: tls ? {} : undefined,

    ...options,
  };

  return new Redis(redisConfig);
}

function attachRedisEvents(name: string, client: Redis) {
  client.on('connect', () => {
    logger.info(`[redis:${name}] connecting`);
  });

  client.on('ready', () => {
    logger.info(`[redis:${name}] ready`);
  });

  client.on('error', (err) => {
    logger.error(err, `[redis:${name}] error`);
  });

  client.on('reconnecting', () => {
    logger.warn(`[redis:${name}] reconnecting`);
  });

  client.on('end', () => {
    logger.warn(`[redis:${name}] connection closed`);
  });
}
