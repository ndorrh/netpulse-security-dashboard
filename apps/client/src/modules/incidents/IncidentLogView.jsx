import React, { useState } from 'react';
import { History, Download, Trash2, Check, AlertOctagon, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useSecurity } from '../../context/SecurityContext.jsx';

export function IncidentLogView({ incidents = [] }) {
  const { resolveIncident, clearIncidents } = useSecurity();

  const handleExport = (format) => {
    window.open(`/api/incidents/export?format=${format}`, '_blank');
  };

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return <Badge variant="red" pulse size="sm">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="red" size="sm">HIGH</Badge>;
      case 'medium':
        return <Badge variant="amber" size="sm">MEDIUM</Badge>;
      default:
        return <Badge variant="blue" size="sm">INFO</Badge>;
    }
  };

  return (
    <Card
      title="Security Incident & Breach Audit Log"
      subtitle="Persistent SQLite Incident History & Forensic Export"
      icon={History}
      badge={
        <Badge variant={incidents.length > 0 ? 'amber' : 'slate'}>
          {incidents.length} RECORDS
        </Badge>
      }
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>EXPORT JSON</span>
          </button>
          {incidents.length > 0 && (
            <button
              onClick={clearIncidents}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
              title="Clear Incident History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <th className="pb-2.5 font-semibold">Timestamp</th>
              <th className="pb-2.5 font-semibold">Incident Title / Details</th>
              <th className="pb-2.5 font-semibold">Source ID</th>
              <th className="pb-2.5 font-semibold">Severity</th>
              <th className="pb-2.5 font-semibold">Mitigation</th>
              <th className="pb-2.5 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  No security incidents recorded. System nominal.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => {
                const isOpen = inc.status === 'open';

                return (
                  <tr key={inc.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 pr-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(inc.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div>
                        <span className="font-bold text-slate-200 block text-xs">{inc.title}</span>
                        {inc.details && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[320px]">
                            {typeof inc.details === 'object' ? JSON.stringify(inc.details) : inc.details}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-300 text-[11px] font-semibold">{inc.source_id}</td>
                    <td className="py-2.5 pr-3">{getSeverityBadge(inc.severity)}</td>
                    <td className="py-2.5 pr-3 text-slate-400 text-[11px]">{inc.mitigation_action}</td>
                    <td className="py-2.5 text-right">
                      {isOpen ? (
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>RESOLVE</span>
                        </button>
                      ) : (
                        <Badge variant="slate" size="sm">RESOLVED</Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
