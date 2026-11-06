import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../');

export const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    host: process.env.HOST || '127.0.0.1', // Strictly local loopback by default (NFR-Security)
    port: parseInt(process.env.PORT || '4000', 10),
    corsOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:4000', 'http://localhost:4000']
  },
  monitoring: {
    pollingIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '1000', 10), // 1s interval (FR-01)
    historyDepth: 60, // 60 seconds rolling history
    maxSubnetScanHosts: 254
  },
  database: {
    dbPath: process.env.DB_PATH || path.join(ROOT_DIR, 'data', 'netpulse.db')
  },
  heuristics: {
    maxSafeBandwidthBytesPerSec: 10 * 1024 * 1024, // 10 MB/s
    standardOutboundPorts: [80, 443, 53, 22, 123, 853, 5353]
  }
};
