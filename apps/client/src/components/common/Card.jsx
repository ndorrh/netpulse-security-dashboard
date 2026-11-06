import React from 'react';
import clsx from 'clsx';

export function Card({ title, subtitle, icon: Icon, badge, action, children, className, borderGlow = 'none' }) {
  const glowClasses = {
    none: 'border-slate-800/80',
    cyan: 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]',
    red: 'border-red-500/50 shadow-[0_0_20px_rgba(255,0,60,0.15)] animate-pulse-fast',
    emerald: 'border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,136,0.08)]',
    amber: 'border-amber-500/40 shadow-[0_0_15px_rgba(255,183,3,0.1)]'
  };

  return (
    <div className={clsx('cyber-card rounded-xl p-5 relative overflow-hidden transition-all duration-300', glowClasses[borderGlow], className)}>
      {/* Header */}
      {(title || Icon || badge || action) && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-cyan-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="truncate">
              <h3 className="font-mono text-sm font-semibold tracking-wide text-slate-100 uppercase">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge}
            {action}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
