import React from 'react';
import { Terminal, ShieldAlert, Key, BatteryCharging, HardDrive, ArrowUpRight, RotateCcw, X, Play, Square } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export function AttackSimulatorDrawer() {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    activeSimulations,
    triggerSimulation,
    ejectSimulation,
    resetSimulations
  } = useSecurity();

  if (!isSimulatorOpen) return null;

  const presets = [
    {
      id: 'BAD_USB',
      title: 'BadUSB Keystroke Injector',
      category: 'Hardware Spoofing',
      icon: Key,
      risk: 'CRITICAL',
      description: 'Emulates a Digispark ATTiny85 Rubber Ducky claiming to be a standard keyboard but injecting keystroke payloads.'
    },
    {
      id: 'SPOOFED_POWERBANK',
      title: 'Spoofed Power Bank (Data Tap)',
      category: 'Trojan Peripheral',
      icon: BatteryCharging,
      risk: 'CRITICAL',
      description: 'Emulates a charging battery bank mounting an unauthorized mass storage and network tap interface.'
    },
    {
      id: 'ROGUE_STORAGE',
      title: 'Unverified USB Flash Drive',
      category: 'Mass Storage',
      icon: HardDrive,
      risk: 'HIGH',
      description: 'Simulates an unauthorized Kingston 3.0 flash drive attempting to mount without prior whitelist clearance.'
    },
    {
      id: 'DATA_EXFILTRATION_NC',
      title: 'Netcat Reverse Shell (Port 4444)',
      category: 'Network Exfiltration',
      icon: ArrowUpRight,
      risk: 'CRITICAL',
      description: 'Initiates a simulated active outbound TCP tunnel from nc to foreign IP 198.51.100.45 on port 4444.'
    },
    {
      id: 'DATA_EXFILTRATION_PYTHON',
      title: 'Python Keylogger Exfiltration',
      category: 'Script Exfiltration',
      icon: Terminal,
      risk: 'HIGH',
      description: 'Simulates a background python3 process streaming unauthorized data to public port 9001.'
    }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#070b14]/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col font-mono animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Security Attack Testbench</h2>
            <p className="text-[11px] text-slate-400">Inject hardware hotplugs & rogue flows</p>
          </div>
        </div>
        <button
          onClick={() => setIsSimulatorOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body with preset cards */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Attack Scenarios</span>
          {activeSimulations.length > 0 && (
            <button
              onClick={resetSimulations}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET ALL ({activeSimulations.length})</span>
            </button>
          )}
        </div>

        {presets.map((preset) => {
          const Icon = preset.icon;
          const isActive = activeSimulations.includes(preset.id);

          return (
            <div
              key={preset.id}
              className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-red-950/30 border-red-500/70 shadow-[0_0_15px_rgba(255,0,60,0.15)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-100">{preset.title}</h3>
                    <span className="text-[10px] text-slate-400">{preset.category}</span>
                  </div>
                </div>
                <Badge variant={preset.risk === 'CRITICAL' ? 'red' : 'amber'} size="sm">
                  {preset.risk}
                </Badge>
              </div>

              <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                {preset.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className={`text-[10px] font-semibold ${isActive ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                  {isActive ? '● ATTACK INJECTED' : '○ Standby'}
                </span>

                {isActive ? (
                  <button
                    onClick={() => ejectSimulation(preset.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    <Square className="w-3 h-3 text-red-400 fill-current" />
                    <span>EJECT / STOP</span>
                  </button>
                ) : (
                  <button
                    onClick={() => triggerSimulation(preset.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-xs font-semibold transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>INJECT ATTACK</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Dual Mode: Real OS + Testbench</span>
        <button
          onClick={resetSimulations}
          className="text-cyan-400 hover:underline"
        >
          Clear All Attacks
        </button>
      </div>
    </div>
  );
}
