import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';

const execAsync = promisify(exec);

export async function collectOutboundSockets() {
  const sockets = [];

  // 1. Try ss command (Linux native, fast)
  try {
    const { stdout } = await execAsync('ss -tunp state established 2>/dev/null || ss -tunp 2>/dev/null');
    const lines = stdout.trim().split('\n');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 5) {
        const proto = parts[0].toUpperCase();
        const localAddr = parts[parts.length - 2] || parts[3];
        const peerAddr = parts[parts.length - 1] || parts[4];
        const processInfo = line.match(/users:\(\("([^"]+)",pid=(\d+)/);

        const [remoteIp, remotePort] = parseAddress(peerAddr);
        const [localIp, localPort] = parseAddress(localAddr);

        if (remoteIp && remoteIp !== '*' && remoteIp !== '0.0.0.0' && remoteIp !== '::') {
          sockets.push({
            protocol: proto,
            localAddress: localAddr,
            localIp,
            localPort: parseInt(localPort, 10) || 0,
            remoteAddress: peerAddr,
            remoteIp,
            remotePort: parseInt(remotePort, 10) || 0,
            processName: processInfo ? processInfo[1] : 'system',
            pid: processInfo ? parseInt(processInfo[2], 10) : 0,
            state: 'ESTABLISHED'
          });
        }
      }
    }
  } catch (err) {
    // Fallback to /proc/net/tcp parsing if ss fails
  }

  // 2. Fallback: Parse /proc/net/tcp directly if no sockets found
  if (sockets.length === 0 && fs.existsSync('/proc/net/tcp')) {
    try {
      const content = fs.readFileSync('/proc/net/tcp', 'utf8');
      const lines = content.trim().split('\n');
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length >= 4) {
          const remHex = parts[2];
          const [remoteIp, remotePort] = hexToIpPort(remHex);
          const [localIp, localPort] = hexToIpPort(parts[1]);

          if (remoteIp && remoteIp !== '0.0.0.0' && remotePort > 0) {
            sockets.push({
              protocol: 'TCP',
              localAddress: `${localIp}:${localPort}`,
              localIp,
              localPort,
              remoteAddress: `${remoteIp}:${remotePort}`,
              remoteIp,
              remotePort,
              processName: 'system',
              pid: 0,
              state: 'ESTABLISHED'
            });
          }
        }
      }
    } catch (err) {
      // Ignore
    }
  }

  return sockets;
}

function parseAddress(addrStr) {
  if (!addrStr) return ['', '0'];
  // Handle IPv6 [::1]:port or IPv4 1.2.3.4:port
  const lastColon = addrStr.lastIndexOf(':');
  if (lastColon === -1) return [addrStr, '0'];
  const ip = addrStr.slice(0, lastColon).replace(/[\[\]]/g, '');
  const port = addrStr.slice(lastColon + 1);
  return [ip, port];
}

function hexToIpPort(hexStr) {
  if (!hexStr || !hexStr.includes(':')) return ['', 0];
  const [ipHex, portHex] = hexStr.split(':');
  const port = parseInt(portHex, 16);
  // IP is in little endian on x86
  const ipBytes = [
    parseInt(ipHex.slice(6, 8), 16),
    parseInt(ipHex.slice(4, 6), 16),
    parseInt(ipHex.slice(2, 4), 16),
    parseInt(ipHex.slice(0, 2), 16)
  ];
  return [ipBytes.join('.'), port];
}
