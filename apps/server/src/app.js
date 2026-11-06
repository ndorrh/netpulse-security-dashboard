import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { apiRouter } from './modules/api/routes/index.js';
import { config } from './modules/core/config/index.js';
import { logger } from './modules/core/logger/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Basic CORS & JSON parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      logger.debug(`${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Serve Client Build if present
  const publicDir = path.resolve(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
      }
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  // 404 handler for API
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    logger.error(`Express error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  });

  return app;
}
