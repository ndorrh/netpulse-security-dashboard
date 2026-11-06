import { getDatabase } from './connection.js';
import { logger } from '../core/logger/index.js';

export function initializeSchema() {
  const log = logger.child('Schema');
  const db = getDatabase();

  log.info('Initializing SQLite security schema...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS device_whitelist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vid TEXT NOT NULL,
      pid TEXT NOT NULL,
      vendor_name TEXT,
      product_name TEXT,
      serial_number TEXT,
      device_class TEXT,
      trust_level TEXT NOT NULL DEFAULT 'trusted',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(vid, pid, serial_number)
    );

    CREATE INDEX IF NOT EXISTS idx_whitelist_vid_pid ON device_whitelist(vid, pid);

    CREATE TABLE IF NOT EXISTS security_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      source_id TEXT,
      title TEXT NOT NULL,
      details TEXT,
      mitigation_action TEXT,
      status TEXT NOT NULL DEFAULT 'open'
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON security_incidents(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_incidents_severity ON security_incidents(severity);

    CREATE TABLE IF NOT EXISTS security_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      severity TEXT NOT NULL DEFAULT 'medium',
      params TEXT
    );

    CREATE TABLE IF NOT EXISTS known_devices_cache (
      mac_prefix TEXT PRIMARY KEY,
      vendor TEXT NOT NULL
    );
  `);

  // Seed default factory rules and safe standard controllers if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM security_policies');
  const result = countStmt.get();

  if (result.count === 0) {
    log.info('Seeding default security policies...');
    const insertPolicy = db.prepare(`
      INSERT INTO security_policies (policy_key, name, description, enabled, severity, params)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertPolicy.run(
      'DISALLOW_UNVERIFIED_STORAGE',
      'Block Unverified USB Mass Storage',
      'Flags any connected USB peripheral presenting a mass storage interface without prior whitelist approval.',
      1,
      'critical',
      JSON.stringify({ targetClass: 'Mass Storage' })
    );

    insertPolicy.run(
      'ALERT_NON_STANDARD_PORTS',
      'Detect Outbound Non-Standard Port Connections',
      'Triggers warning when an outbound socket communicates over ports outside 80, 443, 53, 22.',
      1,
      'high',
      JSON.stringify({ allowedPorts: [80, 443, 53, 22, 123, 853, 5353] })
    );

    insertPolicy.run(
      'ALERT_SUSPICIOUS_SHELL_EXFIL',
      'Detect Shell / Script Exfiltration Processes',
      'Flags outbound network sockets owned by interpreters or raw network utilities (nc, bash, python, curl).',
      1,
      'critical',
      JSON.stringify({ suspiciousProcesses: ['nc', 'ncat', 'python', 'python3', 'bash', 'curl', 'wget'] })
    );

    insertPolicy.run(
      'NEW_SUBNET_DEVICE_ALERT',
      'Subnet Intrusion Detection',
      'Alerts when an unrecognized MAC/IP joins the local network segment.',
      1,
      'medium',
      JSON.stringify({})
    );
  }

  // Pre-seed known safe standard host hubs (e.g., Linux Foundation root hub)
  const whitelistCountStmt = db.prepare('SELECT COUNT(*) as count FROM device_whitelist');
  const wlResult = whitelistCountStmt.get();
  if (wlResult.count === 0) {
    log.info('Seeding standard trusted root controllers...');
    const insertWl = db.prepare(`
      INSERT INTO device_whitelist (vid, pid, vendor_name, product_name, serial_number, device_class, trust_level, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertWl.run(
      '1d6b',
      '0002',
      'Linux Foundation',
      '2.0 Root Hub',
      'root-hub-2',
      'Hub',
      'trusted',
      'System default primary USB 2.0 host controller',
      now,
      now
    );

    insertWl.run(
      '1d6b',
      '0003',
      'Linux Foundation',
      '3.0 Root Hub',
      'root-hub-3',
      'Hub',
      'trusted',
      'System default primary USB 3.0 SuperSpeed host controller',
      now,
      now
    );
  }

  log.info('Database schema successfully initialized.');
}
