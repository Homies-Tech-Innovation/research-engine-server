import http from 'node:http';
import { config } from '@config';
import { globalErrorHandler, rateLimiter, responseEnhancer } from '@middleware';
import { httpLogger } from '@utils/logger/httpLogger';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import responseTime from 'response-time';
import routes from '@/routes';

const app = express();

// Middlewares
app.use(helmet());
app.use(responseTime());
app.use(
  cors({
    origin: config.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(compression());
app.use(httpLogger);
app.use(rateLimiter);
app.use(express.json({ limit: config.env.MAX_PAYLOAD_SIZE }));
app.use(
  express.urlencoded({
    extended: true,
    limit: config.env.MAX_PAYLOAD_SIZE,
  })
);
app.use(hpp());
app.use(responseEnhancer);

// Mount home router
app.use(config.constants.API_PREFIX, routes);

// Global Error handler
app.use(globalErrorHandler);

// Create httpServer for Socket IO
export const server = http.createServer(app);

export default app;
