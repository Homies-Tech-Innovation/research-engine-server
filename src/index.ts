import type { Server } from 'node:http';
import { config } from '@config';
import { logger } from '@utils';
import app from '@/app';

// Start the app
let server: Server;
const init = async () => {
  server = app.listen(config.env.PORT, () => {
    logger.info(`\x1b[92m✔ server running at\x1b[0m http://localhost:${config.env.PORT}`);
  });
};

init();

// Handle uncaught errors
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down.');
  if (server) {
    server.close();
  }
});

// Helper function
function unexpectedErrorHandler(error: unknown) {
  logger.error(error, 'Unexpected Error. Shutting down.');

  // Kill the server properly
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
}
