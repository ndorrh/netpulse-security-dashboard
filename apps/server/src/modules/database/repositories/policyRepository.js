import { getDatabase } from '../connection.js';

export class PolicyRepository {
  constructor() {
    this.db = getDatabase();
  }

  getAll() {
    const stmt = this.db.prepare('SELECT * FROM security_policies ORDER BY id ASC');
    const rows = stmt.all();
    return rows.map(r => ({
      ...r,
      enabled: Boolean(r.enabled),
      params: r.params ? JSON.parse(r.params) : {}
    }));
  }

  getByKey(key) {
    const stmt = this.db.prepare('SELECT * FROM security_policies WHERE policy_key = ?');
    const r = stmt.get(key);
    if (!r) return null;
    return {
      ...r,
      enabled: Boolean(r.enabled),
      params: r.params ? JSON.parse(r.params) : {}
    };
  }

  toggle(policy_key, enabled) {
    const stmt = this.db.prepare('UPDATE security_policies SET enabled = ? WHERE policy_key = ?');
    stmt.run(enabled ? 1 : 0, policy_key);
    return this.getByKey(policy_key);
  }
}

export const policyRepository = new PolicyRepository();
