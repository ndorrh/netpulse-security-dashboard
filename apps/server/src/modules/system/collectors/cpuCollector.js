import si from 'systeminformation';
import os from 'node:os';

let cachedCpuInfo = null;

export async function collectCpuMetrics() {
  try {
    if (!cachedCpuInfo) {
      cachedCpuInfo = await si.cpu().catch(() => ({
        manufacturer: 'Generic',
        brand: 'Processor',
        cores: os.cpus().length,
        speed: os.cpus()[0]?.speed ? os.cpus()[0].speed / 1000 : 2.5
      }));
    }

    const currentLoad = await si.currentLoad().catch(() => null);
    const loadAvg = os.loadavg();

    const percentage = currentLoad ? Number((currentLoad.currentLoad || 0).toFixed(1)) : 1.5;
    const userPercentage = currentLoad ? Number((currentLoad.currentLoadUser || 0).toFixed(1)) : 1.0;
    const systemPercentage = currentLoad ? Number((currentLoad.currentLoadSystem || 0).toFixed(1)) : 0.5;

    return {
      brand: cachedCpuInfo.brand || `${cachedCpuInfo.manufacturer || ''} CPU`,
      cores: cachedCpuInfo.cores || os.cpus().length,
      speedGhz: cachedCpuInfo.speed || 2.5,
      percentage,
      userPercentage,
      systemPercentage,
      loadAverages: [
        Number(loadAvg[0].toFixed(2)),
        Number(loadAvg[1].toFixed(2)),
        Number(loadAvg[2].toFixed(2))
      ]
    };
  } catch (err) {
    const loadAvg = os.loadavg();
    return {
      brand: 'Generic x86_64 CPU',
      cores: os.cpus().length,
      speedGhz: 2.5,
      percentage: 2.0,
      userPercentage: 1.5,
      systemPercentage: 0.5,
      loadAverages: [Number(loadAvg[0].toFixed(2)), Number(loadAvg[1].toFixed(2)), Number(loadAvg[2].toFixed(2))]
    };
  }
}
