import http from 'node:http';
import { createApp } from './app.js';
import { initializeSchema } from './modules/database/schema.js';
import { closeDatabase } from './modules/database/connection.js';
import { wsServer } from './modules/api/websocket/wsServer.js';
import { config } from './modules/core/config/index.js';
import { logger } from './modules/core/logger/index.js';

async function bootstrap() {
  const log = logger.child('Bootstrap');
  log.info('====================================================');
  log.info('  NETPULSE REAL-TIME HARDWARE & NETWORK MONITOR     ');
  log.info('====================================================');

  try {
    // 1. Initialize SQLite Database
    initializeSchema();

    // 2. Create Express Application
    const app = createApp();
    const server = http.createServer(app);

    // 3. Attach WebSocket Telemetry Server
    wsServer.attach(server);

    // 4. Start HTTP Server bound to 127.0.0.1 (Strict loopback security per SRS NFR)
    const { host, port } = config.server;
    server.listen(port, host, () => {
      log.info(`NetPulse Security Daemon active and listening on http://${host}:${port}`);
      log.info(`WebSocket telemetry streaming at ws://${host}:${port}/ws`);
      log.info(`Local Attack Surface & Peripheral Watcher running [polling: ${config.monitoring.pollingIntervalMs}ms]`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      log.warn('Received termination signal. Shutting down gracefully...');
      wsServer.stop();
      server.close(() => {
        closeDatabase();
        log.info('NetPulse daemon exited cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    logger.error(`Critical bootstrap failure: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

bootstrap();
