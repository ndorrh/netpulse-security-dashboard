import React from 'react';
import { Sliders, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useSecurity } from '../../context/SecurityContext.jsx';

export function PolicyEngineView({ policies = [] }) {
  const { togglePolicy } = useSecurity();

  return (
    <Card
      title="Hardware & Network Security Policies"
      subtitle="Autonomous Defense & Intrusion Rule Enforcement"
      icon={Sliders}
      badge={
        <Badge variant="cyan">
          {policies.filter(p => p.enabled).length} ACTIVE RULES
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {policies.map((p) => {
          const isEnabled = p.enabled;

          return (
            <div
              key={p.policy_key}
              className={`p-3.5 rounded-xl border transition-all ${isEnabled ? 'bg-slate-900/60 border-slate-700/80' : 'bg-slate-950/40 border-slate-800/40 opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${isEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="font-bold text-slate-100 text-xs">{p.name}</span>
                </div>
                <button
                  onClick={() => togglePolicy(p.policy_key, !isEnabled)}
                  className={`p-1 rounded transition ${isEnabled ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-600 hover:text-slate-400'}`}
                  title={isEnabled ? 'Disable Policy' : 'Enable Policy'}
                >
                  {isEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                {p.description}
              </p>

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/60">
                <span className="text-slate-500">{p.policy_key}</span>
                <Badge variant={p.severity === 'critical' ? 'red' : 'amber'} size="sm">
                  {p.severity}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
