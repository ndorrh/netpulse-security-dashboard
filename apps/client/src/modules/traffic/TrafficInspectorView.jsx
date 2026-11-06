import React, { useState } from 'react';
import { ArrowUpRight, ShieldAlert, Radio, AlertTriangle, Eye, ShieldCheck, Lock } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export function TrafficInspectorView({ traffic }) {
  const [activeTab, setActiveTab] = useState('outbound'); // 'outbound' or 'listening'
  const outbound = traffic?.outbound || [];
  const listening = traffic?.listeningPorts || [];
  const suspiciousCount = traffic?.suspiciousCount || 0;
  const hasSuspicious = suspiciousCount > 0;

  return (
    <Card
      title="Outbound Data Traffic & Socket Inspector"
      subtitle="Exfiltration Heuristic Engine & Attack Surface Radar"
      icon={ArrowUpRight}
      borderGlow={hasSuspicious ? 'amber' : 'none'}
      badge={
        <Badge variant={hasSuspicious ? 'amber' : 'emerald'} pulse={hasSuspicious} size="lg">
          {hasSuspicious ? `${suspiciousCount} EXFILTRATION FLAGS` : 'TRAFFIC NOMINAL'}
        </Badge>
      }
      action={
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('outbound')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'outbound' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            OUTBOUND FLOWS ({outbound.length})
          </button>
          <button
            onClick={() => setActiveTab('listening')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'listening' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            LISTENING RADAR ({listening.length})
          </button>
        </div>
      }
    >
      {/* Exfiltration Threat Notice if active */}
      {hasSuspicious && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/70 shadow-[0_0_15px_rgba(255,183,3,0.15)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="font-mono text-xs">
            <span className="font-bold text-amber-300 block uppercase tracking-wider text-sm">
              POTENTIAL DATA EXFILTRATION FLAGGED
            </span>
            <p className="text-amber-200 mt-0.5">
              Outbound socket connections detected communicating over non-standard destination ports or initiated by scripting engines/raw shells (e.g., netcat, python, curl).
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Outbound Traffic Table */}
      {activeTab === 'outbound' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2.5 font-semibold">Process / PID</th>
                <th className="pb-2.5 font-semibold">Local Socket</th>
                <th className="pb-2.5 font-semibold">Remote Destination</th>
                <th className="pb-2.5 font-semibold">Protocol</th>
                <th className="pb-2.5 font-semibold">Security Heuristic</th>
                <th className="pb-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {outbound.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No active external socket connections detected.
                  </td>
                </tr>
              ) : (
                outbound.map((conn, idx) => {
                  const isSuspicious = conn.isSuspicious;

                  return (
                    <tr
                      key={idx}
                      className={`transition ${isSuspicious ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'hover:bg-slate-900/40'}`}
                    >
                      {/* Process */}
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isSuspicious ? 'text-amber-300' : 'text-slate-200'}`}>
                            {conn.processName}
                          </span>
                          {conn.pid > 0 && (
                            <span className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                              PID:{conn.pid}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Local */}
                      <td className="py-2.5 pr-3 text-slate-400">
                        {conn.localIp}:{conn.localPort}
                      </td>

                      {/* Remote Destination */}
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{conn.remoteIp}</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${isSuspicious ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-cyan-400'}`}>
                            :{conn.remotePort}
                          </span>
                        </div>
                      </td>

                      {/* Protocol */}
                      <td className="py-2.5 pr-3">
                        <Badge variant="slate" size="sm">
                          {conn.protocol}
                        </Badge>
                      </td>

                      {/* Flags */}
                      <td className="py-2.5 pr-3">
                        {isSuspicious ? (
                          <div className="space-y-0.5">
                            {conn.flags?.map((flag, fIdx) => (
                              <span key={fIdx} className="text-[10px] text-amber-400 block font-semibold truncate max-w-[280px]" title={flag}>
                                • {flag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-400">Standard Traffic</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 text-right">
                        <Badge variant={isSuspicious ? 'amber' : 'emerald'} size="sm">
                          {isSuspicious ? 'SUSPECT' : 'VERIFIED'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Listening Ports Radar (Attack Surface Analysis) */}
      {activeTab === 'listening' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2.5 font-semibold">Port</th>
                <th className="pb-2.5 font-semibold">Bind Address</th>
                <th className="pb-2.5 font-semibold">Daemon Process</th>
                <th className="pb-2.5 font-semibold">Exposure Scope</th>
                <th className="pb-2.5 font-semibold text-right">Attack Surface Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {listening.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No listening ports discovered.
                  </td>
                </tr>
              ) : (
                listening.map((port, idx) => {
                  const isWildcard = port.isWildcard;

                  return (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 pr-3">
                        <span className="font-bold text-cyan-400 text-sm">:{port.port}</span>
                        <span className="ml-1 text-[10px] text-slate-500">{port.protocol}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300">{port.bindIp}</td>
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold text-slate-200">{port.processName}</span>
                        {port.pid > 0 && <span className="text-slate-500 text-[10px] ml-1">({port.pid})</span>}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge variant={isWildcard ? 'amber' : 'slate'} size="sm">
                          {isWildcard ? '0.0.0.0 (PUBLIC INTERFACES)' : '127.0.0.1 (LOOPBACK ONLY)'}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[11px] font-semibold ${isWildcard ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isWildcard ? 'Public Exposure' : 'Secured Loopback'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
