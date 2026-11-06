import { collectMemoryMetrics } from './collectors/memoryCollector.js';
import { collectDiskMetrics } from './collectors/diskCollector.js';
import { collectCpuMetrics } from './collectors/cpuCollector.js';
import { config } from '../core/config/index.js';

export class SystemService {
  constructor() {
    this.historyDepth = config.monitoring.historyDepth || 60;
    this.memoryHistory = [];
    this.cpuHistory = [];
    this.diskIOHistory = [];
    this.lastMetrics = null;
  }

  async poll() {
    const [memory, disk, cpu] = await Promise.all([
      collectMemoryMetrics(),
      collectDiskMetrics(),
      collectCpuMetrics()
    ]);

    const timestamp = new Date().toISOString();

    // Push to rolling history arrays
    this.memoryHistory.push({
      time: timestamp,
      usedMb: Math.round(memory.used / (1024 * 1024)),
      percentage: memory.percentage
    });
    if (this.memoryHistory.length > this.historyDepth) {
      this.memoryHistory.shift();
    }

    this.cpuHistory.push({
      time: timestamp,
      percentage: cpu.percentage
    });
    if (this.cpuHistory.length > this.historyDepth) {
      this.cpuHistory.shift();
    }

    this.diskIOHistory.push({
      time: timestamp,
      readKb: Math.round(disk.io.readSpeedBytesPerSec / 1024),
      writeKb: Math.round(disk.io.writeSpeedBytesPerSec / 1024)
    });
    if (this.diskIOHistory.length > this.historyDepth) {
      this.diskIOHistory.shift();
    }

    this.lastMetrics = {
      timestamp,
      memory,
      disk,
      cpu,
      history: {
        memory: this.memoryHistory,
        cpu: this.cpuHistory,
        diskIO: this.diskIOHistory
      }
    };

    return this.lastMetrics;
  }

  getLatest() {
    return this.lastMetrics;
  }
}

export const systemService = new SystemService();
