import { KNOWN_SUSPICIOUS_PROCESSES, STANDARD_SAFE_PORTS, EXFILTRATION_SEVERITY } from '@netpulse/shared';

export function evaluateConnection(conn) {
  const flags = [];
  let severity = EXFILTRATION_SEVERITY.LOW;
  let isSuspicious = false;

  const port = parseInt(conn.remotePort, 10);
  const processName = (conn.processName || '').toLowerCase();
  const remoteIp = conn.remoteIp || '';

  const isLocalOrPrivate = isPrivateIp(remoteIp);

  // 1. Check for Known Suspicious Process Names
  const matchesSuspiciousProcess = KNOWN_SUSPICIOUS_PROCESSES.some(p => processName === p || processName.startsWith(`${p}.`));
  if (matchesSuspiciousProcess) {
    flags.push(`Suspicious exfiltration process detected: '${processName}'`);
    severity = EXFILTRATION_SEVERITY.HIGH;
    isSuspicious = true;
  }

  // 2. Check for Non-Standard Outbound Port
  if (!STANDARD_SAFE_PORTS.includes(port)) {
    flags.push(`Non-standard destination port ${port} (outside 80, 443, 53, 22)`);
    if (isSuspicious) {
      severity = EXFILTRATION_SEVERITY.CRITICAL;
    } else {
      severity = EXFILTRATION_SEVERITY.MEDIUM;
      isSuspicious = true;
    }
  }

  // 3. Known Reverse Shell / Exfiltration Ports
  const knownAttackPorts = [4444, 1337, 31337, 6667, 8888, 9001, 9999, 5555];
  if (knownAttackPorts.includes(port)) {
    flags.push(`CRITICAL: Port ${port} is a known default payload/reverse-shell port!`);
    severity = EXFILTRATION_SEVERITY.CRITICAL;
    isSuspicious = true;
  }

  // 4. Public IP + Suspicious combination
  if (!isLocalOrPrivate && isSuspicious) {
    flags.push(`Public Internet endpoint target (${remoteIp})`);
    if (matchesSuspiciousProcess) {
      severity = EXFILTRATION_SEVERITY.CRITICAL;
    }
  }

  return {
    ...conn,
    isSuspicious,
    severity,
    flags,
    isLocalOrPrivate
  };
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const secondOctet = parseInt(ip.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }
  return false;
}
