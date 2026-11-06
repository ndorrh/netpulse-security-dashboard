import { whitelistRepository } from '../../database/repositories/whitelistRepository.js';
import { incidentRepository } from '../../database/repositories/incidentRepository.js';
import { PERIPHERAL_TRUST_LEVELS } from '@netpulse/shared';

export function auditDevice(device) {
  const vid = (device.vid || '').toLowerCase();
  const pid = (device.pid || '').toLowerCase();
  const serial = device.serialNumber || 'UNKNOWN';

  // Check against SQLite whitelist
  const whitelistEntry = whitelistRepository.findByVidPid(vid, pid, serial);

  let trustStatus = PERIPHERAL_TRUST_LEVELS.UNTRUSTED;
  let isRogue = false;
  let threatReasons = [];

  if (whitelistEntry && whitelistEntry.trust_level === 'trusted') {
    trustStatus = PERIPHERAL_TRUST_LEVELS.TRUSTED;
  } else if (whitelistEntry && whitelistEntry.trust_level === 'blocked') {
    trustStatus = PERIPHERAL_TRUST_LEVELS.BLOCKED;
    isRogue = true;
    threatReasons.push('Device is explicitly blacklisted in SQLite database.');
  } else {
    // Untrusted device evaluation
    trustStatus = PERIPHERAL_TRUST_LEVELS.UNTRUSTED;
    isRogue = true;
    threatReasons.push(`Device [VID: 0x${vid}, PID: 0x${pid}] is not in the trusted whitelist.`);

    // High priority rogue characteristics:
    if (device.deviceClass === 'Mass Storage') {
      threatReasons.push('Unauthorized USB Mass Storage interface mounted - potential data exfiltration risk.');
    }
    if (device.isSpoofedCharger) {
      threatReasons.push('CRITICAL: Device masquerading as power bank/charger while mounting unauthorized data interface!');
    }
    if (device.isBadUsb) {
      threatReasons.push('CRITICAL: Synthetic keystroke injection profile detected (BadUSB / Rubber Ducky fingerprint)!');
    }
    if (device.deviceClass === 'Network Interface') {
      threatReasons.push('Rogue virtual network adapter detected - risk of rogue proxy routing or DNS hijacking.');
    }
  }

  return {
    ...device,
    trustStatus,
    isRogue,
    threatReasons,
    whitelistId: whitelistEntry ? whitelistEntry.id : null,
    auditedAt: new Date().toISOString()
  };
}
