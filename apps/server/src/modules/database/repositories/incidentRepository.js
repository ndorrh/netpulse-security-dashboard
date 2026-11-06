import { getDatabase } from '../connection.js';

export class IncidentRepository {
  constructor() {
    this.db = getDatabase();
  }

  logIncident({ event_type, severity, source_id, title, details, mitigation_action = 'ISOLATION_ALERT', status = 'open' }) {
    const timestamp = new Date().toISOString();
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

    const stmt = this.db.prepare(`
      INSERT INTO security_incidents (timestamp, event_type, severity, source_id, title, details, mitigation_action, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(timestamp, event_type, severity, source_id, title, detailsStr, mitigation_action, status);

    const getStmt = this.db.prepare('SELECT * FROM security_incidents WHERE id = last_insert_rowid()');
    return getStmt.get();
  }

  getRecent(limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM security_incidents ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(limit);
  }

  getActiveBreaches() {
    const stmt = this.db.prepare("SELECT * FROM security_incidents WHERE status = 'open' AND severity IN ('critical', 'high') ORDER BY timestamp DESC");
    return stmt.all();
  }

  resolveIncident(id, resolutionNote = 'Acknowledged by operator') {
    const stmt = this.db.prepare("UPDATE security_incidents SET status = 'resolved', details = details || ' [RESOLVED: ' || ? || ']' WHERE id = ?");
    stmt.run(resolutionNote, id);
    const getStmt = this.db.prepare('SELECT * FROM security_incidents WHERE id = ?');
    return getStmt.get(id);
  }

  clearAll() {
    this.db.exec('DELETE FROM security_incidents');
    return true;
  }
}

export const incidentRepository = new IncidentRepository();
