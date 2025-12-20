import type { Server as httpServer } from 'node:http';
import { config } from '@config';
import { connections } from '@redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { logger } from '@utils';
import { Server } from 'socket.io';
import customMsgPackParser from 'socket.io-msgpack-parser';

let io: Server;

export const initIO = (httpServer: httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: config.env.CORS_ORIGIN },
    adapter: createAdapter(connections.socketPubClient, connections.socketSubClient),
    parser: customMsgPackParser,
  });
  io.on('connection', (socket) => {
    logger.info(`Socket.IO Connected: ${socket.id}`);

    // Use middlewares
    //

    // Register modular handlers
    //

    socket.on('disconnect', (reason) => {
      logger.warn(`Socket.IO Disconnected: ${socket.id} due to ${reason}`);
    });
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
};
