import React from 'react';
import { Cpu, HardDrive, Database, Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export function SystemMonitorView({ system }) {
  const mem = system?.memory || { total: 0, used: 0, free: 0, available: 0, percentage: 0 };
  const disk = system?.disk || { drives: [], io: { readSpeedBytesPerSec: 0, writeSpeedBytesPerSec: 0, readIops: 0, writeIops: 0 } };
  const cpu = system?.cpu || { brand: 'CPU', cores: 4, percentage: 0, loadAverages: [0, 0, 0] };
  const history = system?.history || { memory: [], cpu: [], diskIO: [] };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // SVG Sparkline generator
  const renderSparkline = (data = [], maxVal = 100, color = '#00f0ff') => {
    if (data.length < 2) return null;
    const width = 200;
    const height = 40;
    const step = width / (data.length - 1);
    const points = data
      .map((val, idx) => {
        const y = height - (Math.min(val, maxVal) / maxVal) * height;
        return `${idx * step},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#grad-${color.replace('#', '')})`} />
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Real-Time RAM Utilization (FR-01) */}
      <Card
        title="RAM Utilization"
        subtitle="1s Polling Interval"
        icon={Database}
        badge={
          <Badge variant={mem.percentage > 85 ? 'red' : mem.percentage > 70 ? 'amber' : 'cyan'}>
            {mem.percentage}% USED
          </Badge>
        }
      >
        <div className="space-y-4">
          {/* Main RAM Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Total: {formatBytes(mem.total)}</span>
              <span className="text-cyan-400 font-bold">{formatBytes(mem.used)} Used</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${mem.percentage > 85 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                style={{ width: `${Math.min(mem.percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Detailed Memory Specs */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 font-mono text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Free Blocks</span>
              <span className="text-emerald-400 font-bold text-sm">{formatBytes(mem.free)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Available</span>
              <span className="text-cyan-400 font-bold text-sm">{formatBytes(mem.available)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Buffers / Cache</span>
              <span className="text-slate-200 font-bold">{formatBytes(mem.buffers + mem.cached)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Swap Alloc</span>
              <span className="text-slate-200 font-bold">{formatBytes(mem.swapUsed)}</span>
            </div>
          </div>

          {/* Real-Time RAM Sparkline */}
          <div className="pt-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>RAM History (60s)</span>
              <span>{mem.percentage}%</span>
            </div>
            {renderSparkline(history.memory.map(m => m.percentage), 100, '#00f0ff')}
          </div>
        </div>
      </Card>

      {/* 2. Disk Capacity & I/O Load (FR-01) */}
      <Card
        title="Disk Storage & I/O"
        subtitle="Volumes & Read/Write Load"
        icon={HardDrive}
        badge={
          <Badge variant="blue">
            {disk.drives.length} DRIVE{disk.drives.length > 1 ? 'S' : ''}
          </Badge>
        }
      >
        <div className="space-y-4">
          {/* Drives List */}
          <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
            {disk.drives.map((d, idx) => (
              <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-200 font-bold truncate max-w-[140px]">{d.mount} ({d.fs})</span>
                  <span className="text-cyan-400">{d.usePercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${d.usePercentage > 90 ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min(d.usePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Free: {formatBytes(d.available)}</span>
                  <span>Cap: {formatBytes(d.size)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Real-Time Disk I/O Speeds */}
          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Live Throughput Rates</span>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">DISK READ</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {formatBytes(disk.io.readSpeedBytesPerSec)}/s
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">DISK WRITE</span>
                  <span className="text-blue-400 font-bold text-sm">
                    {formatBytes(disk.io.writeSpeedBytesPerSec)}/s
                  </span>
                </div>
                <ArrowUp className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Host Processor & Load Averages */}
      <Card
        title="Host CPU Telemetry"
        subtitle={`${cpu.cores} Physical / Logical Cores`}
        icon={Cpu}
        badge={
          <Badge variant={cpu.percentage > 80 ? 'red' : 'emerald'}>
            {cpu.percentage}% LOAD
          </Badge>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 truncate max-w-[180px]">{cpu.brand}</span>
              <span className="text-emerald-400 font-bold">{cpu.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(cpu.percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 font-mono text-center">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[9px] uppercase">1m Avg</span>
              <span className="text-cyan-400 font-bold text-xs">{cpu.loadAverages[0]}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[9px] uppercase">5m Avg</span>
              <span className="text-slate-300 font-bold text-xs">{cpu.loadAverages[1]}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[9px] uppercase">15m Avg</span>
              <span className="text-slate-300 font-bold text-xs">{cpu.loadAverages[2]}</span>
            </div>
          </div>

          {/* Real-time CPU Sparkline */}
          <div className="pt-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>CPU Activity (60s)</span>
              <span>{cpu.percentage}%</span>
            </div>
            {renderSparkline(history.cpu.map(c => c.percentage), 100, '#00ff88')}
          </div>
        </div>
      </Card>
    </div>
  );
}
