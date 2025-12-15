import { config } from '@config';
import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';
import { pinoLogger } from './logger';

export const httpLogger = pinoHttp({
  logger: pinoLogger,

  // Assign request id
  genReqId: (req: Request, res: Response) => {
    let id = req.headers['x-request-id'] || req.headers['trace-parent'];
    if (id) return id;

    id = crypto.randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },

  // Formatting logs
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Ignore non-essential routes
  autoLogging: {
    ignore: (req: Request) => shouldLogRequest(req.url),
  },
});

// Helper function
function shouldLogRequest(url: string) {
  if (config.constants.IGNORED_ROUTES.has(url)) return true;
  if (url.startsWith('/public') || url.startsWith('/assets')) return true;
  return false;
}
