import React from 'react';
import { Shield, Radio, Volume2, VolumeX, Terminal, ShieldAlert } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export function Header() {
  const { wsStatus, muted, toggleMute, setIsSimulatorOpen, isSimulatorOpen, activeSimulations, telemetry } = useSecurity();

  const isWsConnected = wsStatus === 'CONNECTED';
  const hasActiveSimulations = activeSimulations.length > 0;

  return (
    <header className="border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Moniker */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Shield className="w-5 h-5" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#070b14] ${isWsConnected ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black tracking-wider text-slate-100 uppercase">NetPulse</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400 font-semibold uppercase">v1.0.0</span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight">OS Network, Hardware & Peripheral Security</p>
          </div>
        </div>

        {/* Center Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERFACE:</span>
            <span className="text-cyan-400 font-bold">{telemetry?.network?.primaryMedium || 'ETHERNET'}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <span>UPSTREAM:</span>
            <span className="text-emerald-400 font-bold">{telemetry?.network?.gateway || '192.168.1.1'}</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status */}
          <Badge variant={isWsConnected ? 'emerald' : 'red'} pulse={!isWsConnected} size="sm">
            {isWsConnected ? 'WS LIVE' : 'WS RECONNECT'}
          </Badge>

          {/* Audio Alarm Mute Toggle */}
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
            className={`p-2 rounded-lg border transition ${muted ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'}`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Attack Simulator Testbench Button */}
          <button
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition border ${hasActiveSimulations ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_15px_rgba(255,0,60,0.3)] animate-pulse' : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-400'}`}
          >
            {hasActiveSimulations ? <ShieldAlert className="w-4 h-4" /> : <Terminal className="w-4 h-4 text-cyan-400" />}
            <span>Attack Simulator</span>
            {hasActiveSimulations && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
