import { policyRepository } from '../../database/repositories/policyRepository.js';

export const policyController = {
  getAll: (req, res) => {
    try {
      const policies = policyRepository.getAll();
      res.json({ success: true, data: policies });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  toggle: (req, res) => {
    try {
      const { policy_key } = req.params;
      const { enabled } = req.body;
      const updated = policyRepository.toggle(policy_key, enabled);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
