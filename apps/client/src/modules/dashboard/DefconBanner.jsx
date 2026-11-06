import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, Flame } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext.jsx';

export function DefconBanner() {
  const { telemetry } = useSecurity();
  const threat = telemetry?.threat || { defcon: 5, label: 'DEFCON 5 - NORMAL', color: 'emerald', summary: 'System nominal' };

  const defconConfigs = {
    1: {
      bg: 'bg-gradient-to-r from-red-950/80 via-red-900/60 to-black',
      border: 'border-red-500/80',
      text: 'text-red-400',
      icon: Flame,
      glow: 'shadow-[0_0_25px_rgba(255,0,60,0.3)] animate-pulse'
    },
    2: {
      bg: 'bg-gradient-to-r from-orange-950/80 via-amber-900/50 to-black',
      border: 'border-orange-500/70',
      text: 'text-orange-400',
      icon: AlertOctagon,
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]'
    },
    3: {
      bg: 'bg-gradient-to-r from-amber-950/70 via-yellow-900/40 to-black',
      border: 'border-amber-500/60',
      text: 'text-amber-400',
      icon: AlertTriangle,
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    },
    4: {
      bg: 'bg-gradient-to-r from-blue-950/60 via-slate-900/50 to-black',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      icon: ShieldCheck,
      glow: ''
    },
    5: {
      bg: 'bg-gradient-to-r from-emerald-950/50 via-slate-900/40 to-black',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      icon: ShieldCheck,
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]'
    }
  };

  const currentCfg = defconConfigs[threat.defcon] || defconConfigs[5];
  const Icon = currentCfg.icon;

  return (
    <div className={`rounded-xl border ${currentCfg.border} ${currentCfg.bg} ${currentCfg.glow} p-4 transition-all duration-500`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Defcon Gauge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-black/50 p-2 rounded-lg border border-slate-800">
            {[5, 4, 3, 2, 1].map((lvl) => {
              const isActive = threat.defcon === lvl;
              const isWorse = threat.defcon <= lvl;
              const barColors = {
                5: 'bg-emerald-500',
                4: 'bg-blue-500',
                3: 'bg-amber-500',
                2: 'bg-orange-500',
                1: 'bg-red-500'
              };
              return (
                <div
                  key={lvl}
                  className={`w-4 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-all ${isActive ? `${barColors[lvl]} text-black font-black scale-110 shadow-lg` : isWorse ? `${barColors[lvl]}/40 text-slate-300` : 'bg-slate-800 text-slate-600'}`}
                >
                  {lvl}
                </div>
              );
            })}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${currentCfg.text}`} />
              <h2 className={`font-mono text-base font-black tracking-wider uppercase ${currentCfg.text}`}>
                {threat.label}
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{threat.summary}</p>
          </div>
        </div>

        {/* Right: Quick Counts */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase">Rogue Peripherals</span>
            <span className={`font-bold text-sm ${telemetry?.peripherals?.untrustedCount > 0 ? 'text-red-400 animate-pulse font-black' : 'text-emerald-400'}`}>
              {telemetry?.peripherals?.untrustedCount || 0} UNTRUSTED
            </span>
          </div>

          <div className="h-7 w-[1px] bg-slate-800" />

          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase">Suspicious Sockets</span>
            <span className={`font-bold text-sm ${telemetry?.traffic?.suspiciousCount > 0 ? 'text-orange-400 animate-pulse font-black' : 'text-emerald-400'}`}>
              {telemetry?.traffic?.suspiciousCount || 0} EXFIL RISK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
