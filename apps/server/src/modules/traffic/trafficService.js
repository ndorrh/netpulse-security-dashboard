import { collectOutboundSockets } from './collectors/socketCollector.js';
import { collectListeningPorts } from './collectors/listeningPortsCollector.js';
import { evaluateConnection } from './heuristics/exfiltrationEngine.js';
import { incidentRepository } from '../database/repositories/incidentRepository.js';
import { eventBus, EVENTS } from '../core/events/eventBus.js';
import { logger } from '../core/logger/index.js';

export class TrafficService {
  constructor() {
    this.activeSockets = [];
    this.listeningPorts = [];
    this.simulatedSockets = [];
    this.flaggedHistory = new Set();
    this.lastSuspiciousCount = 0;
  }

  injectSimulatedSocket(socket) {
    this.simulatedSockets.push(socket);
    logger.security(`[Attack Simulator] Injected synthetic socket flow: ${socket.processName} -> ${socket.remoteIp}:${socket.remotePort}`);
  }

  clearSimulatedSockets() {
    this.simulatedSockets = [];
  }

  async poll() {
    const rawSockets = await collectOutboundSockets();
    const listening = await collectListeningPorts();
    const allSockets = [...rawSockets, ...this.simulatedSockets];

    const evaluated = allSockets.map(evaluateConnection);
    const suspiciousSockets = evaluated.filter(s => s.isSuspicious);

    // Alert on new suspicious exfiltration flows
    for (const s of suspiciousSockets) {
      const flowKey = `${s.processName}:${s.remoteIp}:${s.remotePort}`;
      if (!this.flaggedHistory.has(flowKey)) {
        this.flaggedHistory.add(flowKey);
        eventBus.emit(EVENTS.EXFILTRATION_FLAGGED, s);
        logger.security(`Potential Exfiltration Alert! ${s.processName} -> ${s.remoteIp}:${s.remotePort} (${s.flags.join(', ')})`);

        incidentRepository.logIncident({
          event_type: 'DATA_EXFILTRATION_SUSPECT',
          severity: s.severity,
          source_id: `NET:${s.remoteIp}:${s.remotePort}`,
          title: `Suspicious Outbound Flow: ${s.processName} (${s.remoteIp}:${s.remotePort})`,
          details: {
            processName: s.processName,
            pid: s.pid,
            remoteIp: s.remoteIp,
            remotePort: s.remotePort,
            flags: s.flags
          },
          mitigation_action: 'EXFILTRATION_ALERT',
          status: 'open'
        });
      }
    }

    this.activeSockets = evaluated;
    this.listeningPorts = listening;
    this.lastSuspiciousCount = suspiciousSockets.length;

    return {
      outbound: evaluated,
      totalCount: evaluated.length,
      suspiciousCount: suspiciousSockets.length,
      listeningPorts: listening
    };
  }

  getLatest() {
    return {
      outbound: this.activeSockets,
      totalCount: this.activeSockets.length,
      suspiciousCount: this.lastSuspiciousCount,
      listeningPorts: this.listeningPorts
    };
  }
}

export const trafficService = new TrafficService();
