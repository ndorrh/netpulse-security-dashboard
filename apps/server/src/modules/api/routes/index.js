import { Router } from 'express';
import { whitelistController } from '../controllers/whitelistController.js';
import { incidentController } from '../controllers/incidentController.js';
import { networkController } from '../controllers/networkController.js';
import { simulatorController } from '../controllers/simulatorController.js';
import { policyController } from '../controllers/policyController.js';
import { systemService } from '../../system/systemService.js';
import { peripheralService } from '../../peripheral/peripheralService.js';
import { trafficService } from '../../traffic/trafficService.js';

export const apiRouter = Router();

// System Status summary
apiRouter.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    system: systemService.getLatest(),
    peripherals: peripheralService.getLatest(),
    traffic: trafficService.getLatest(),
    network: networkController.getStatus
  });
});

// Whitelist Endpoints
apiRouter.get('/whitelist', whitelistController.getAll);
apiRouter.post('/whitelist', whitelistController.add);
apiRouter.put('/whitelist/:id', whitelistController.updateTrust);
apiRouter.delete('/whitelist/:id', whitelistController.delete);

// Incident Endpoints
apiRouter.get('/incidents', incidentController.getAll);
apiRouter.post('/incidents/:id/resolve', incidentController.resolve);
apiRouter.post('/incidents/clear', incidentController.clear);
apiRouter.get('/incidents/export', incidentController.export);

// Network Endpoints
apiRouter.get('/network', networkController.getStatus);
apiRouter.post('/network/scan', networkController.scanSubnet);

// Attack Simulator Endpoints
apiRouter.get('/simulator/presets', simulatorController.getPresets);
apiRouter.post('/simulator/trigger', simulatorController.trigger);
apiRouter.post('/simulator/eject', simulatorController.eject);
apiRouter.post('/simulator/reset', simulatorController.reset);

// Policy Endpoints
apiRouter.get('/policies', policyController.getAll);
apiRouter.post('/policies/:policy_key/toggle', policyController.toggle);
