import { config } from '@config';
import { initRedis, shutdownRedis } from '@redis';
import { logger } from '@utils';
import { server } from '@/app';
import { initIO } from './socket/socket.service';

// Helper variables
let isShuttingDown = false;

// Start the app
const init = async () => {
  // Make all Redis connections
  logger.info('Initializing redis connections...');
  await initRedis();
  logger.info('✔ Redis connections initialized');

  // Initialize Socket IO
  initIO(server);

  server.listen(config.env.PORT, () => {
    logger.info(`\x1b[92m✔ server running at\x1b[0m http://localhost:${config.env.PORT}`);
  });
};

init().catch((error) => {
  logger.error(error, 'Failed to initialize app');
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Handle signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => {
  process.stdout.write('\r');
  gracefulShutdown('SIGINT');
});

// Helper functions
async function unexpectedErrorHandler(error: unknown) {
  logger.error(error, 'Unexpected Error/Rejection Detected');
  await gracefulShutdown('UNEXPECTED_ERROR', 1);
}

async function gracefulShutdown(signal: string, exitCode: number = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Force exit if cleanup hangs longer than 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();

  try {
    if (server) {
      if (server.closeAllConnections) server.closeAllConnections();

      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }
    logger.info('HTTP server closed.');
    // Shutdown Redis
    await shutdownRedis();
    logger.info('Redis connections closed.');

    logger.info(`Shutdown complete. Exiting with code ${exitCode}.`);
    process.exit(exitCode);
  } catch (error) {
    logger.error(error, 'Error during graceful shutdown');
    process.exit(1);
  }
}
