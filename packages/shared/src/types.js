/**
 * Standard data models for NetPulse
 */

export const KNOWN_SUSPICIOUS_PROCESSES = [
  'nc',
  'ncat',
  'netcat',
  'bash',
  'sh',
  'zsh',
  'curl',
  'wget',
  'python',
  'python3',
  'perl',
  'ruby',
  'socat',
  'meterpreter'
];

export const STANDARD_SAFE_PORTS = [
  80,   // HTTP
  443,  // HTTPS
  53,   // DNS
  22,   // SSH
  123,  // NTP
  853,  // DNS over TLS
  5353  // mDNS
];
