import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeSchema } from '../src/modules/database/schema.js';
import { whitelistRepository } from '../src/modules/database/repositories/whitelistRepository.js';
import { incidentRepository } from '../src/modules/database/repositories/incidentRepository.js';
import { auditDevice } from '../src/modules/peripheral/auditors/deviceAuditor.js';

test('Database schema initializes and allows Whitelist operations', () => {
  initializeSchema();

  const testVid = 'aaaa';
  const testPid = 'bbbb';

  // 1. Add device to whitelist
  const added = whitelistRepository.addDevice({
    vid: testVid,
    pid: testPid,
    vendor_name: 'Antigravity Test Lab',
    product_name: 'Test Secure Dongle',
    serial_number: 'TEST-1234',
    device_class: 'HID Peripheral',
    trust_level: 'trusted'
  });

  assert.ok(added.id, 'Inserted device must have an ID');
  assert.equal(added.vid, testVid);
  assert.equal(added.trust_level, 'trusted');

  // 2. Audit device verifies it is trusted
  const audit = auditDevice({
    vid: testVid,
    pid: testPid,
    serialNumber: 'TEST-1234',
    name: 'Test Secure Dongle',
    deviceClass: 'HID Peripheral'
  });
  assert.equal(audit.isRogue, false);
  assert.equal(audit.trustStatus, 'trusted');

  // 3. Audit unrecognized device flags as rogue
  const rogueAudit = auditDevice({
    vid: 'dead',
    pid: 'beef',
    serialNumber: 'ROGUE-000',
    name: 'Rubber Ducky Clone',
    deviceClass: 'Mass Storage'
  });
  assert.equal(rogueAudit.isRogue, true);
  assert.equal(rogueAudit.trustStatus, 'untrusted');
  assert.ok(rogueAudit.threatReasons.length > 0);

  // Clean up
  whitelistRepository.deleteDevice(added.id);
});

test('Incident repository records and retrieves security events', () => {
  const incident = incidentRepository.logIncident({
    event_type: 'TEST_ALERT',
    severity: 'high',
    source_id: 'TEST_SRC',
    title: 'Unit Test Security Anomaly',
    details: { reason: 'Automated test' }
  });

  assert.ok(incident.id);
  assert.equal(incident.event_type, 'TEST_ALERT');
  assert.equal(incident.status, 'open');

  const resolved = incidentRepository.resolveIncident(incident.id, 'Test resolution');
  assert.equal(resolved.status, 'resolved');
});
