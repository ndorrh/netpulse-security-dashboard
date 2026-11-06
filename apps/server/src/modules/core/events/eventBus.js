import { EventEmitter } from 'node:events';

export const EVENTS = {
  TELEMETRY_UPDATED: 'telemetry:updated',
  PERIPHERAL_ATTACHED: 'peripheral:attached',
  PERIPHERAL_DETACHED: 'peripheral:detached',
  ROGUE_PERIPHERAL_DETECTED: 'peripheral:rogue',
  EXFILTRATION_FLAGGED: 'traffic:exfiltration',
  POLICY_TRIGGERED: 'policy:triggered',
  THREAT_LEVEL_CHANGED: 'threat:changed',
  SUBNET_SCAN_COMPLETED: 'network:scan_completed'
};

class NetPulseEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}

export const eventBus = new NetPulseEventBus();
