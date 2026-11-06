import { WebSocketServer, WebSocket } from 'ws';
import { WS_EVENTS } from '@netpulse/shared';
import { systemService } from '../../system/systemService.js';
import { networkService } from '../../network/networkService.js';
import { peripheralService } from '../../peripheral/peripheralService.js';
import { trafficService } from '../../traffic/trafficService.js';
import { calculateThreatLevel } from '../../threat/threatEngine.js';
import { incidentRepository } from '../../database/repositories/incidentRepository.js';
import { config } from '../../core/config/index.js';
import { logger } from '../../core/logger/index.js';

export class NetPulseWebSocketServer {
  constructor() {
    this.wss = null;
    this.intervalId = null;
    this.clients = new Set();
  }

  attach(httpServer) {
    const log = logger.child('WebSocket');
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      log.info(`Dashboard client connected from ${req.socket.remoteAddress}. Active clients: ${this.clients.size}`);

      // Send initial snapshot immediately upon connection
      this.sendSnapshot(ws);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleClientMessage(ws, message);
        } catch (err) {
          log.warn(`Error handling WS message: ${err.message}`);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        log.info(`Dashboard client disconnected. Active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        log.error(`WebSocket client error: ${err.message}`);
        this.clients.delete(ws);
      });
    });

    // Start 1-second telemetry broadcast loop
    this.startTelemetryLoop();
  }

  async handleClientMessage(ws, msg) {
    if (!msg || !msg.type) return;

    if (msg.type === 'TRUST_DEVICE') {
      const { vid, pid, alias, deviceClass } = msg.payload || {};
      peripheralService.trustDevice(vid, pid, alias, deviceClass);
      this.broadcastTelemetry();
    } else if (msg.type === 'TRIGGER_SCAN') {
      await networkService.triggerSubnetScan();
      this.broadcastTelemetry();
    } else if (msg.type === 'RESOLVE_INCIDENT') {
      incidentRepository.resolveIncident(msg.payload.id, 'Resolved via HUD button');
      this.broadcastTelemetry();
    }
  }

  async sendSnapshot(ws) {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      const payload = await this.compileTelemetryPayload();
      ws.send(JSON.stringify(payload));
    } catch (err) {
      logger.error(`Error sending initial WS snapshot: ${err.message}`);
    }
  }

  async compileTelemetryPayload() {
    const [system, network, peripherals, traffic] = await Promise.all([
      systemService.poll(),
      networkService.poll(),
      peripheralService.poll(),
      trafficService.poll()
    ]);

    const threat = calculateThreatLevel(peripherals, traffic);
    const recentIncidents = incidentRepository.getRecent(10);

    return {
      type: WS_EVENTS.TELEMETRY_UPDATE,
      timestamp: new Date().toISOString(),
      system,
      network,
      peripherals,
      traffic,
      threat,
      recentIncidents
    };
  }

  startTelemetryLoop() {
    const interval = config.monitoring.pollingIntervalMs || 1000;
    this.intervalId = setInterval(async () => {
      if (this.clients.size === 0) return;
      await this.broadcastTelemetry();
    }, interval);
  }

  async broadcastTelemetry() {
    try {
      const payload = await this.compileTelemetryPayload();
      const message = JSON.stringify(payload);

      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    } catch (err) {
      logger.error(`Failed to broadcast telemetry: ${err.message}`);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsServer = new NetPulseWebSocketServer();
