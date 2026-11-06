import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, icon: Icon, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`cyber-card w-full ${maxWidth} rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h2 className="font-mono text-base font-bold uppercase tracking-wider text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
