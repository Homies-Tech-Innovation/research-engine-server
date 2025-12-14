import { config } from '@config';
import pino from 'pino';

// Configure Pino logger
export const pinoLogger = pino({
  transport:
    config.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
  level: config.env.LOG_LEVEL,
});

// Create a universal logger wrapper
export const logger = {
  info: (arg: unknown, msg?: string) => pinoLogger.info(arg, msg),
  error: (arg: unknown, msg?: string) => {
    if (config.env.NODE_ENV === 'production') {
      pinoLogger.error(arg, msg);
      return;
    }
    if (msg) console.error(`[ERROR] ${msg}`);
    console.error(arg);
  },
  debug: (arg: unknown, msg?: string) => pinoLogger.debug(arg, msg),
  warn: (arg: unknown, msg?: string) => pinoLogger.warn(arg, msg),
};

export default logger;
