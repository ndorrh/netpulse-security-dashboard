import { getDatabase } from '../connection.js';

export class WhitelistRepository {
  constructor() {
    this.db = getDatabase();
  }

  getAll() {
    const stmt = this.db.prepare('SELECT * FROM device_whitelist ORDER BY created_at DESC');
    return stmt.all();
  }

  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM device_whitelist WHERE id = ?');
    return stmt.get(id);
  }

  findByVidPid(vid, pid, serial = null) {
    if (serial) {
      const stmt = this.db.prepare(
        'SELECT * FROM device_whitelist WHERE vid = ? AND pid = ? AND serial_number = ?'
      );
      const res = stmt.get(vid.toLowerCase(), pid.toLowerCase(), serial);
      if (res) return res;
    }
    const stmt = this.db.prepare(
      'SELECT * FROM device_whitelist WHERE vid = ? AND pid = ?'
    );
    return stmt.get(vid.toLowerCase(), pid.toLowerCase());
  }

  addDevice({ vid, pid, vendor_name, product_name, serial_number = 'UNKNOWN', device_class = 'Generic', trust_level = 'trusted', notes = '' }) {
    const now = new Date().toISOString();
    const existing = this.findByVidPid(vid, pid, serial_number);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE device_whitelist
        SET vendor_name = ?, product_name = ?, device_class = ?, trust_level = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(vendor_name || existing.vendor_name, product_name || existing.product_name, device_class || existing.device_class, trust_level, notes || existing.notes, now, existing.id);
      return this.getById(existing.id);
    }

    const stmt = this.db.prepare(`
      INSERT INTO device_whitelist (vid, pid, vendor_name, product_name, serial_number, device_class, trust_level, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      vid.toLowerCase(),
      pid.toLowerCase(),
      vendor_name || 'Generic Vendor',
      product_name || 'Generic Device',
      serial_number,
      device_class,
      trust_level,
      notes,
      now,
      now
    );

    return this.findByVidPid(vid, pid, serial_number);
  }

  updateTrust(id, trust_level) {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE device_whitelist SET trust_level = ?, updated_at = ? WHERE id = ?');
    stmt.run(trust_level, now, id);
    return this.getById(id);
  }

  deleteDevice(id) {
    const stmt = this.db.prepare('DELETE FROM device_whitelist WHERE id = ?');
    stmt.run(id);
    return true;
  }
}

export const whitelistRepository = new WhitelistRepository();
