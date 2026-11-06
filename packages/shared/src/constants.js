export const WS_EVENTS = {
  TELEMETRY_UPDATE: 'TELEMETRY_UPDATE',
  INCIDENT_ALERT: 'INCIDENT_ALERT',
  SIMULATION_EVENT: 'SIMULATION_EVENT',
  POLICY_UPDATE: 'POLICY_UPDATE',
  CLIENT_COMMAND: 'CLIENT_COMMAND'
};

export const THREAT_LEVELS = {
  DEFCON_5: { level: 5, label: 'DEFCON 5 - NORMAL', color: 'emerald', description: 'System operating within nominal security parameters.' },
  DEFCON_4: { level: 4, label: 'DEFCON 4 - ADVISORY', color: 'blue', description: 'Minor anomaly detected, low risk.' },
  DEFCON_3: { level: 3, label: 'DEFCON 3 - ELEVATED', color: 'amber', description: 'Unrecognized peripheral or non-standard outbound port.' },
  DEFCON_2: { level: 2, label: 'DEFCON 2 - HIGH ALERT', color: 'orange', description: 'Suspicious process exfiltration attempt detected.' },
  DEFCON_1: { level: 1, label: 'DEFCON 1 - CRITICAL BREACH', color: 'red', description: 'Rogue peripheral device mounted without authorization.' }
};

export const PERIPHERAL_TRUST_LEVELS = {
  TRUSTED: 'trusted',
  UNTRUSTED: 'untrusted',
  BLOCKED: 'blocked',
  INVESTIGATING: 'investigating'
};

export const NETWORK_MEDIUM_TYPES = {
  WIFI: 'Wi-Fi',
  ETHERNET: 'Wired (Ethernet)',
  LOOPBACK: 'Virtual / Loopback',
  UNKNOWN: 'Unknown'
};

export const EXFILTRATION_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};
