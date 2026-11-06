import { readHostUsbDevices } from './collectors/usbCollector.js';
import { auditDevice } from './auditors/deviceAuditor.js';
import { whitelistRepository } from '../database/repositories/whitelistRepository.js';
import { incidentRepository } from '../database/repositories/incidentRepository.js';
import { eventBus, EVENTS } from '../core/events/eventBus.js';
import { logger } from '../core/logger/index.js';

export class PeripheralService {
  constructor() {
    this.knownDevices = new Map(); // key: vid:pid:serial
    this.simulatedDevices = new Map(); // devices injected by simulator
    this.activePeripherals = [];
    this.lastUntrustedCount = 0;
  }

  // Allow attack simulator to inject a simulated hardware device
  injectSimulatedDevice(device) {
    const key = `${device.vid}:${device.pid}:${device.serialNumber || 'SIM'}`;
    this.simulatedDevices.set(key, device);
    logger.security(`[Attack Simulator] Injected peripheral: ${device.name} [0x${device.vid}:0x${device.pid}]`);
  }

  ejectSimulatedDevice(vid, pid, serialNumber = 'SIM') {
    const key = `${vid}:${pid}:${serialNumber}`;
    this.simulatedDevices.delete(key);
    logger.info(`[Attack Simulator] Ejected simulated peripheral: 0x${vid}:0x${pid}`);
  }

  clearSimulatedDevices() {
    this.simulatedDevices.clear();
  }

  async poll() {
    const hostDevices = await readHostUsbDevices();
    const allRawDevices = [...hostDevices, ...Array.from(this.simulatedDevices.values())];

    const auditedDevices = [];
    const currentKeys = new Set();
    let untrustedCount = 0;

    for (const rawDev of allRawDevices) {
      const audited = auditDevice(rawDev);
      const key = `${audited.vid}:${audited.pid}:${audited.serialNumber || 'N/A'}`;
      currentKeys.add(key);
      auditedDevices.push(audited);

      if (audited.isRogue) {
        untrustedCount++;
      }

      // Hotplug Insertion Detection
      if (!this.knownDevices.has(key)) {
        this.knownDevices.set(key, audited);
        eventBus.emit(EVENTS.PERIPHERAL_ATTACHED, audited);

        if (audited.isRogue) {
          logger.security(`Rogue peripheral connected: ${audited.name} [VID: 0x${audited.vid}, PID: 0x${audited.pid}]`);
          incidentRepository.logIncident({
            event_type: 'ROGUE_PERIPHERAL',
            severity: audited.isSpoofedCharger || audited.isBadUsb ? 'critical' : 'high',
            source_id: `USB:${audited.vid}:${audited.pid}`,
            title: `Rogue Peripheral Detected: ${audited.name}`,
            details: {
              vid: audited.vid,
              pid: audited.pid,
              manufacturer: audited.manufacturer,
              deviceClass: audited.deviceClass,
              threatReasons: audited.threatReasons
            },
            mitigation_action: 'ISOLATION_WARNING',
            status: 'open'
          });
          eventBus.emit(EVENTS.ROGUE_PERIPHERAL_DETECTED, audited);
        }
      }
    }

    // Hotplug Detachment Detection
    for (const [key, dev] of this.knownDevices.entries()) {
      if (!currentKeys.has(key)) {
        this.knownDevices.delete(key);
        eventBus.emit(EVENTS.PERIPHERAL_DETACHED, dev);
        logger.info(`Peripheral disconnected: ${dev.name} [0x${dev.vid}:0x${dev.pid}]`);
      }
    }

    this.activePeripherals = auditedDevices;
    this.lastUntrustedCount = untrustedCount;

    return {
      connected: auditedDevices,
      totalCount: auditedDevices.length,
      untrustedCount,
      trustedCount: auditedDevices.length - untrustedCount
    };
  }

  trustDevice(vid, pid, alias = '', deviceClass = 'Generic') {
    const result = whitelistRepository.addDevice({
      vid,
      pid,
      vendor_name: alias || 'Operator Verified Vendor',
      product_name: alias || 'Trusted Device',
      device_class: deviceClass,
      trust_level: 'trusted',
      notes: 'Approved via NetPulse Real-Time Security Dashboard'
    });
    // Invalidate cached audit
    for (const [key, dev] of this.knownDevices.entries()) {
      if (dev.vid.toLowerCase() === vid.toLowerCase() && dev.pid.toLowerCase() === pid.toLowerCase()) {
        dev.trustStatus = 'trusted';
        dev.isRogue = false;
        dev.threatReasons = [];
      }
    }
    logger.info(`Device 0x${vid}:0x${pid} marked as TRUSTED in SQLite whitelist`);
    return result;
  }

  revokeDevice(id) {
    return whitelistRepository.deleteDevice(id);
  }

  getLatest() {
    return {
      connected: this.activePeripherals,
      totalCount: this.activePeripherals.length,
      untrustedCount: this.lastUntrustedCount,
      trustedCount: this.activePeripherals.length - this.lastUntrustedCount
    };
  }
}

export const peripheralService = new PeripheralService();
