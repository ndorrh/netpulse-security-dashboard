import si from 'systeminformation';
import os from 'node:os';
import fs from 'node:fs';

export async function collectMemoryMetrics() {
  try {
    const mem = await si.mem();
    const total = mem.total || os.totalmem();
    const free = mem.free || os.freemem();
    const used = mem.used || (total - free);
    const active = mem.active || used;
    const percentage = Number(((used / total) * 100).toFixed(1));

    return {
      total,
      used,
      free,
      available: mem.available || free,
      buffers: mem.buffers || 0,
      cached: mem.cached || 0,
      percentage,
      swapTotal: mem.swaptotal || 0,
      swapUsed: mem.swapused || 0
    };
  } catch (err) {
    // Robust fallback to node:os
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      total,
      used,
      free,
      available: free,
      buffers: 0,
      cached: 0,
      percentage: Number(((used / total) * 100).toFixed(1)),
      swapTotal: 0,
      swapUsed: 0
    };
  }
}
