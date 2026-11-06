import { networkService } from '../../network/networkService.js';

export const networkController = {
  getStatus: (req, res) => {
    try {
      const data = networkService.getLatest();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  scanSubnet: async (req, res) => {
    try {
      const devices = await networkService.triggerSubnetScan();
      res.json({ success: true, data: devices, count: devices.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
