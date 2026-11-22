import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { testConnection, closePool } from './database/pool.js';
import { initSocket } from './sockets/socketHandler.js';

async function bootstrap() {
  const dbOk = await testConnection();
  if (!dbOk) {
    logger.warn('Continuing without DB — some routes will fail until MySQL is available.');
  }

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.clientOrigin, 'http://localhost:5173'],
      credentials: true,
    },
  });
  initSocket(io);

  httpServer.listen(config.port, () => {
    logger.success(`🚀 Server listening on http://localhost:${config.port}`);
    logger.info(`   Env: ${config.env}`);
    logger.info(`   Client origin: ${config.clientOrigin}`);
  });

  const shutdown = async (signal) => {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);
    httpServer.close();
    await closePool();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error(`Fatal startup error: ${err.message}`);
  console.error(err);
  process.exit(1);
});