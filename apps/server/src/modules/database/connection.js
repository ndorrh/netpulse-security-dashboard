import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../core/config/index.js';
import { logger } from '../core/logger/index.js';

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const log = logger.child('Database');
  const dbDir = path.dirname(config.database.dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    log.info(`Created database directory at ${dbDir}`);
  }

  log.info(`Connecting to SQLite database at ${config.database.dbPath}`);
  dbInstance = new DatabaseSync(config.database.dbPath);

  // Enable WAL mode for high concurrency and performance
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
