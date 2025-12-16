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
      return pinoLogger.error(arg, msg);
    }
    if (typeof arg === 'string') {
      msg = arg;
    }
    const timestamp = new Date().toLocaleTimeString('en-GB', {
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3, // Adds the milliseconds (.123)
    });

    if (msg) {
      console.error(`[${timestamp}] ERROR: ${msg}`);
    }
    if (typeof arg !== 'string') {
      console.error(arg);
    }
  },
  debug: (arg: unknown, msg?: string) => pinoLogger.debug(arg, msg),
  warn: (arg: unknown, msg?: string) => pinoLogger.warn(arg, msg),
};

export default logger;
