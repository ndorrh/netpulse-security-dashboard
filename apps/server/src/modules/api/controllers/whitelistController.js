import { whitelistRepository } from '../../database/repositories/whitelistRepository.js';
import { peripheralService } from '../../peripheral/peripheralService.js';

export const whitelistController = {
  getAll: (req, res) => {
    try {
      const items = whitelistRepository.getAll();
      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  add: (req, res) => {
    try {
      const { vid, pid, vendor_name, product_name, serial_number, device_class, trust_level, notes } = req.body;
      if (!vid || !pid) {
        return res.status(400).json({ success: false, error: 'VID and PID are required' });
      }
      const device = peripheralService.trustDevice(vid, pid, product_name || vendor_name, device_class || 'Generic');
      res.json({ success: true, data: device });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateTrust: (req, res) => {
    try {
      const { id } = req.params;
      const { trust_level } = req.body;
      const updated = whitelistRepository.updateTrust(id, trust_level);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  delete: (req, res) => {
    try {
      const { id } = req.params;
      whitelistRepository.deleteDevice(id);
      res.json({ success: true, message: `Device ${id} removed from whitelist` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
