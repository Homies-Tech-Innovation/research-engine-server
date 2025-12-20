import { connections } from '@redis';
import { error, logger } from '@utils';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { getIO } from '@/socket/socket.service';

const router = Router();

// Index endpoint
router.get('/', (_req, res: Response) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is running',
    endpoints: ['/health/live', '/health/ready'],
  });
});

// Live check
router.get('/live', (_req, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Deep health check
router.get('/ready', async (_req: Request, res: Response, next) => {
  try {
    const redisStatus = getRedisStatus();
    const socketStatus = getSocketIOStatus();

    const isRedisHealthy = Object.values(redisStatus).every((status) => status === 'healthy');
    const isSocketHealthy = socketStatus.status === 'healthy';
    const isSystemHealthy = isRedisHealthy && isSocketHealthy;

    const healthStatus = {
      status: isSystemHealthy ? 'UP' : 'DOWN',
      message: 'Health check successful',
      services: {
        redis: redisStatus,
        socketio: socketStatus,
        server: 'healthy',
      },
      timestamp: new Date().toISOString(),
    };

    if (!isSystemHealthy) {
      const unhealthyServices = [];
      if (!isRedisHealthy) unhealthyServices.push('Redis');
      if (!isSocketHealthy) unhealthyServices.push('Socket.IO');

      return next(
        new error.core.AppError(
          `Service(s) unhealthy: ${unhealthyServices.join(', ')}`,
          503,
          'SERVICE_UNAVAILABLE',
          healthStatus
        )
      );
    }

    res.status(200).json(healthStatus);
  } catch (err) {
    next(err);
  }
});

// Helper function
function getRedisStatus() {
  return Object.fromEntries(
    Object.entries(connections).map(([key, value]) => [
      key,
      value.status === 'ready' ? 'healthy' : 'unhealthy',
    ])
  ) as Record<keyof typeof connections, 'healthy' | 'unhealthy'>;
}

function getSocketIOStatus() {
  try {
    const io = getIO();

    // Check if Socket.IO is initialized and has adapter
    if (!io || !io.sockets || !io.sockets.adapter) {
      return {
        status: 'unhealthy' as const,
        reason: 'Socket.IO not properly initialized',
        connectedClients: 0,
      };
    }

    // Get connected clients count
    const connectedClients = io.sockets.sockets.size;

    return {
      status: 'healthy' as const,
      connectedClients,
      adapterReady: !!io.sockets.adapter,
    };
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Socket.IO health check error:', err.message);
    }

    return {
      status: 'unhealthy' as const,
      reason: 'Socket.IO health check failed',
      connectedClients: 0,
    };
  }
}

export default router;
