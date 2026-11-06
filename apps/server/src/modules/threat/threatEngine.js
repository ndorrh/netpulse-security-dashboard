import { THREAT_LEVELS } from '@netpulse/shared';

export function calculateThreatLevel(peripheralsData, trafficData) {
  const untrustedPeripherals = (peripheralsData?.connected || []).filter(p => p.isRogue);
  const suspiciousTraffic = (trafficData?.outbound || []).filter(t => t.isSuspicious);

  // Check for critical threats
  const hasCriticalPeripheral = untrustedPeripherals.some(p => p.isSpoofedCharger || p.isBadUsb || p.deviceClass === 'Mass Storage');
  const hasCriticalTraffic = suspiciousTraffic.some(t => t.severity === 'critical');

  if (hasCriticalPeripheral || hasCriticalTraffic) {
    return {
      defcon: 1,
      ...THREAT_LEVELS.DEFCON_1,
      summary: hasCriticalPeripheral
        ? 'CRITICAL: Rogue peripheral (BadUSB / Spoofed Power Bank / Storage) detected!'
        : 'CRITICAL: High-risk reverse shell or exfiltration stream active!'
    };
  }

  // Check for Level 2
  const hasHighTraffic = suspiciousTraffic.some(t => t.severity === 'high');
  if (untrustedPeripherals.length > 0 || hasHighTraffic) {
    return {
      defcon: 2,
      ...THREAT_LEVELS.DEFCON_2,
      summary: untrustedPeripherals.length > 0
        ? `HIGH ALERT: ${untrustedPeripherals.length} untrusted peripheral(s) attached.`
        : 'HIGH ALERT: Suspicious process exfiltration attempt flagged.'
    };
  }

  // Check for Level 3
  if (suspiciousTraffic.length > 0) {
    return {
      defcon: 3,
      ...THREAT_LEVELS.DEFCON_3,
      summary: `ELEVATED: ${suspiciousTraffic.length} non-standard outbound socket(s) detected.`
    };
  }

  // Nominal state
  return {
    defcon: 5,
    ...THREAT_LEVELS.DEFCON_5,
    summary: 'ALL CLEAR: Host operating within nominal security parameters.'
  };
}
