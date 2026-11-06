import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function collectListeningPorts() {
  const listening = [];

  try {
    const { stdout } = await execAsync('ss -tlpn 2>/dev/null || netstat -tlpn 2>/dev/null');
    const lines = stdout.trim().split('\n');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        const proto = parts[0].toUpperCase();
        const localAddr = parts[3];
        const lastColon = localAddr.lastIndexOf(':');
        const port = lastColon !== -1 ? parseInt(localAddr.slice(lastColon + 1), 10) : 0;
        const bindIp = lastColon !== -1 ? localAddr.slice(0, lastColon).replace(/[\[\]]/g, '') : '0.0.0.0';

        const procMatch = line.match(/users:\(\("([^"]+)",pid=(\d+)/);

        if (port > 0) {
          listening.push({
            protocol: proto,
            port,
            bindIp,
            isWildcard: bindIp === '0.0.0.0' || bindIp === '::' || bindIp === '*',
            processName: procMatch ? procMatch[1] : 'daemon',
            pid: procMatch ? parseInt(procMatch[2], 10) : 0,
            riskLevel: (bindIp === '0.0.0.0' || bindIp === '*') ? 'ELEVATED (Publicly Bound)' : 'LOW (Loopback Only)'
          });
        }
      }
    }
  } catch (err) {
    // Return empty if not available
  }

  return listening;
}
