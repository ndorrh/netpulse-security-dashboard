import React from 'react';
import clsx from 'clsx';

export function Badge({ children, variant = 'slate', pulse = false, size = 'md' }) {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    slate: 'bg-slate-800/60 text-slate-400 border-slate-700/50'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono font-medium rounded-md border tracking-wider uppercase',
        variantStyles[variant] || variantStyles.slate,
        sizeStyles[size],
        pulse && 'animate-pulse'
      )}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
      {children}
    </span>
  );
}
