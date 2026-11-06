import { peripheralService } from '../peripheral/peripheralService.js';
import { trafficService } from '../traffic/trafficService.js';
import { logger } from '../core/logger/index.js';

export const SIMULATION_PRESETS = {
  BAD_USB: {
    id: 'BAD_USB',
    name: 'BadUSB Keystroke Injector (Rubber Ducky)',
    description: 'Emulates an unauthorized microcontroller spoofing a standard HID keyboard with payload injection capabilities.',
    device: {
      vid: '16c0',
      pid: '05df',
      name: 'Digispark ATTiny85 Keystroke Injector',
      manufacturer: 'Digistump LLC',
      serialNumber: 'DUCKY-8921-EXFIL',
      deviceClass: 'HID Peripheral',
      isBadUsb: true
    }
  },
  SPOOFED_POWERBANK: {
    id: 'SPOOFED_POWERBANK',
    name: 'Spoofed Power Bank (Hidden Data Tap)',
    description: 'Hardware masquerading as a benign charging hub while enumerating mass storage and network tap interfaces.',
    device: {
      vid: '05ac',
      pid: '12a8',
      name: 'UltraCharge 20000mAh Power Bank (Trojan Tap)',
      manufacturer: 'Shenzhen PowerTech',
      serialNumber: 'CHARGER-TAP-007',
      deviceClass: 'Mass Storage',
      isSpoofedCharger: true
    }
  },
  ROGUE_STORAGE: {
    id: 'ROGUE_STORAGE',
    name: 'Unverified USB Flash Drive',
    description: 'Unwhitelisted external storage media attempting to mount filesystem.',
    device: {
      vid: '0951',
      pid: '1666',
      name: 'Kingston DataTraveler 3.0',
      manufacturer: 'Kingston Technology',
      serialNumber: 'KT-99120-STORAGE',
      deviceClass: 'Mass Storage'
    }
  },
  DATA_EXFILTRATION_NC: {
    id: 'DATA_EXFILTRATION_NC',
    name: 'Netcat Reverse Shell Stream',
    description: 'Simulates an active reverse shell process establishing an outbound TCP tunnel to port 4444.',
    socket: {
      protocol: 'TCP',
      localAddress: '192.168.1.105:54320',
      localIp: '192.168.1.105',
      localPort: 54320,
      remoteAddress: '198.51.100.45:4444',
      remoteIp: '198.51.100.45',
      remotePort: 4444,
      processName: 'nc',
      pid: 31337,
      state: 'ESTABLISHED'
    }
  },
  DATA_EXFILTRATION_PYTHON: {
    id: 'DATA_EXFILTRATION_PYTHON',
    name: 'Python Keylogger Exfiltration',
    description: 'Simulates a background Python script streaming keystroke buffers to an unauthorized foreign server.',
    socket: {
      protocol: 'TCP',
      localAddress: '192.168.1.105:58912',
      localIp: '192.168.1.105',
      localPort: 58912,
      remoteAddress: '203.0.113.88:9001',
      remoteIp: '203.0.113.88',
      remotePort: 9001,
      processName: 'python3',
      pid: 40102,
      state: 'ESTABLISHED'
    }
  }
};

export class AttackSimulator {
  constructor() {
    this.activeSimulations = new Set();
  }

  trigger(presetKey) {
    const preset = SIMULATION_PRESETS[presetKey];
    if (!preset) {
      throw new Error(`Unknown simulation preset: ${presetKey}`);
    }

    this.activeSimulations.add(presetKey);

    if (preset.device) {
      peripheralService.injectSimulatedDevice(preset.device);
    }
    if (preset.socket) {
      trafficService.injectSimulatedSocket(preset.socket);
    }

    logger.security(`Triggered security simulation: ${preset.name}`);
    return { success: true, preset: presetKey, active: Array.from(this.activeSimulations) };
  }

  eject(presetKey) {
    const preset = SIMULATION_PRESETS[presetKey];
    if (!preset) return { success: false };

    this.activeSimulations.delete(presetKey);

    if (preset.device) {
      peripheralService.ejectSimulatedDevice(preset.device.vid, preset.device.pid, preset.device.serialNumber);
    }

    logger.info(`Ejected simulation: ${preset.name}`);
    return { success: true, preset: presetKey, active: Array.from(this.activeSimulations) };
  }

  resetAll() {
    this.activeSimulations.clear();
    peripheralService.clearSimulatedDevices();
    trafficService.clearSimulatedSockets();
    logger.info('Reset all attack simulations to nominal state.');
    return { success: true, active: [] };
  }

  getActive() {
    return Array.from(this.activeSimulations);
  }
}

export const attackSimulator = new AttackSimulator();
