import { attackSimulator, SIMULATION_PRESETS } from '../../simulator/attackSimulator.js';

export const simulatorController = {
  getPresets: (req, res) => {
    res.json({
      success: true,
      presets: SIMULATION_PRESETS,
      active: attackSimulator.getActive()
    });
  },

  trigger: (req, res) => {
    try {
      const { preset } = req.body;
      const result = attackSimulator.trigger(preset);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  eject: (req, res) => {
    try {
      const { preset } = req.body;
      const result = attackSimulator.eject(preset);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  reset: (req, res) => {
    try {
      const result = attackSimulator.resetAll();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
