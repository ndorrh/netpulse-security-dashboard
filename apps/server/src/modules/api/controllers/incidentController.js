import { incidentRepository } from '../../database/repositories/incidentRepository.js';

export const incidentController = {
  getAll: (req, res) => {
    try {
      const limit = parseInt(req.query.limit || '100', 10);
      const incidents = incidentRepository.getRecent(limit);
      res.json({ success: true, data: incidents });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  resolve: (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body || {};
      const resolved = incidentRepository.resolveIncident(id, note || 'Resolved by security operator');
      res.json({ success: true, data: resolved });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  clear: (req, res) => {
    try {
      incidentRepository.clearAll();
      res.json({ success: true, message: 'All security incident records cleared' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  export: (req, res) => {
    try {
      const format = (req.query.format || 'json').toLowerCase();
      const incidents = incidentRepository.getRecent(1000);

      if (format === 'csv') {
        const headers = ['id', 'timestamp', 'event_type', 'severity', 'source_id', 'title', 'mitigation_action', 'status'];
        const rows = incidents.map(inc => {
          return headers.map(h => `"${String(inc[h] || '').replace(/"/g, '""')}"`).join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="netpulse_incident_audit_log.csv"');
        return res.send(csvContent);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="netpulse_incident_audit_log.json"');
      res.json(incidents);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
