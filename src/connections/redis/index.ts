import { connections } from './connections';

export { connections };

export async function initRedis() {
  const redisClients = getRedisClients();
  await Promise.all(redisClients.map((client) => client.ping()));
}

export async function shutdownRedis() {
  const redisClients = getRedisClients();
  await Promise.all(redisClients.map((client) => client.quit()));
}

// Helper function
function getRedisClients() {
  return Object.values(connections).filter(
    (v) => typeof v === 'object' && v !== null && 'quit' in v && 'ping' in v
  );
}
