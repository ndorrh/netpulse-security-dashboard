import fs from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { resolveMacVendor } from '../lookup/ouiResolver.js';

const execAsync = promisify(exec);

export async function readArpCache() {
  const devices = [];

  // Try parsing /proc/net/arp first (zero spawn overhead on Linux)
  try {
    if (fs.existsSync('/proc/net/arp')) {
      const content = fs.readFileSync('/proc/net/arp', 'utf8');
      const lines = content.trim().split('\n');
      // Line format: IP address HW type Flags HW address Mask Device
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length >= 6) {
          const ip = parts[0];
          const mac = parts[3];
          const iface = parts[5];
          if (mac && mac !== '00:00:00:00:00:00') {
            devices.push({
              ip,
              mac: mac.toUpperCase(),
              interface: iface,
              vendor: resolveMacVendor(mac),
              state: 'REACHABLE',
              lastSeen: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (err) {
    // Ignore and fallback
  }

  // If /proc/net/arp returned empty or on other environments, try `ip neigh` or `arp -a`
  if (devices.length === 0) {
    try {
      const { stdout } = await execAsync('ip neigh show 2>/dev/null || arp -a 2>/dev/null');
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        // e.g. 192.168.1.1 dev eth0 lladdr 00:11:22:33:44:55 REACHABLE
        const match = line.match(/(\d+\.\d+\.\d+\.\d+).*?(?:lladdr|at)\s+([0-9a-fA-F:-]{17}|[0-9a-fA-F:-]{14})/);
        if (match) {
          const ip = match[1];
          const mac = match[2].toUpperCase();
          if (!devices.some(d => d.ip === ip)) {
            devices.push({
              ip,
              mac,
              interface: 'primary',
              vendor: resolveMacVendor(mac),
              state: line.includes('FAILED') ? 'STALE' : 'REACHABLE',
              lastSeen: new Date().toISOString()
            });
          }
        }
      }
    } catch (err) {
      // Fallback
    }
  }

  return devices;
}
