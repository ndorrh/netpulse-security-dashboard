import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateConnection } from '../src/modules/traffic/heuristics/exfiltrationEngine.js';
import { calculateThreatLevel } from '../src/modules/threat/threatEngine.js';

test('Standard HTTPS connection is evaluated as normal/safe', () => {
  const conn = {
    protocol: 'TCP',
    localAddress: '192.168.1.100:54120',
    localIp: '192.168.1.100',
    localPort: 54120,
    remoteAddress: '142.250.190.46:443',
    remoteIp: '142.250.190.46',
    remotePort: 443,
    processName: 'chrome',
    pid: 1200
  };

  const evalResult = evaluateConnection(conn);
  assert.equal(evalResult.isSuspicious, false);
  assert.equal(evalResult.severity, 'low');
});

test('Netcat connection to port 4444 is flagged as critical exfiltration', () => {
  const conn = {
    protocol: 'TCP',
    localAddress: '192.168.1.100:59100',
    localIp: '192.168.1.100',
    localPort: 59100,
    remoteAddress: '198.51.100.45:4444',
    remoteIp: '198.51.100.45',
    remotePort: 4444,
    processName: 'nc',
    pid: 31337
  };

  const evalResult = evaluateConnection(conn);
  assert.equal(evalResult.isSuspicious, true);
  assert.equal(evalResult.severity, 'critical');
  assert.ok(evalResult.flags.length >= 2);
});

test('Threat calculation escalates to DEFCON 1 when rogue peripheral exists', () => {
  const peripheralsData = {
    connected: [
      {
        vid: '16c0',
        pid: '05df',
        isRogue: true,
        isBadUsb: true,
        deviceClass: 'HID Peripheral'
      }
    ]
  };
  const trafficData = { outbound: [] };

  const threat = calculateThreatLevel(peripheralsData, trafficData);
  assert.equal(threat.defcon, 1);
  assert.equal(threat.color, 'red');
});
