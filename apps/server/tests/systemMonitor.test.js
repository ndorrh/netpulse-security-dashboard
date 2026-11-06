import test from 'node:test';
import assert from 'node:assert/strict';
import { collectMemoryMetrics } from '../src/modules/system/collectors/memoryCollector.js';
import { collectDiskMetrics } from '../src/modules/system/collectors/diskCollector.js';
import { collectCpuMetrics } from '../src/modules/system/collectors/cpuCollector.js';

test('Memory Collector returns valid RAM metrics', async () => {
  const mem = await collectMemoryMetrics();
  assert.ok(mem.total > 0, 'Total RAM must be greater than 0');
  assert.ok(mem.used >= 0, 'Used RAM must be >= 0');
  assert.ok(mem.free >= 0, 'Free RAM must be >= 0');
  assert.ok(mem.percentage >= 0 && mem.percentage <= 100, 'RAM percentage must be between 0 and 100');
});

test('Disk Collector returns mounted partitions and IO structures', async () => {
  const disk = await collectDiskMetrics();
  assert.ok(Array.isArray(disk.drives), 'Drives must be an array');
  assert.ok(disk.drives.length > 0, 'Must have at least one partition reported');
  assert.ok(typeof disk.io.readSpeedBytesPerSec === 'number');
  assert.ok(typeof disk.io.writeSpeedBytesPerSec === 'number');
});

test('CPU Collector returns load metrics', async () => {
  const cpu = await collectCpuMetrics();
  assert.ok(cpu.cores > 0, 'CPU cores must be > 0');
  assert.ok(typeof cpu.percentage === 'number');
  assert.ok(Array.isArray(cpu.loadAverages));
});
