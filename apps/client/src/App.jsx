import React, { useState } from 'react';
import { Shield, Activity, Network, Usb, ArrowUpRight, History, Sliders } from 'lucide-react';
import { useSecurity } from './context/SecurityContext.jsx';
import { Header } from './modules/dashboard/Header.jsx';
import { DefconBanner } from './modules/dashboard/DefconBanner.jsx';
import { SystemMonitorView } from './modules/system/SystemMonitorView.jsx';
import { NetworkMediumView } from './modules/network/NetworkMediumView.jsx';
import { PeripheralAuditView } from './modules/peripheral/PeripheralAuditView.jsx';
import { TrafficInspectorView } from './modules/traffic/TrafficInspectorView.jsx';
import { IncidentLogView } from './modules/incidents/IncidentLogView.jsx';
import { PolicyEngineView } from './modules/policies/PolicyEngineView.jsx';
import { AttackSimulatorDrawer } from './modules/simulator/AttackSimulatorDrawer.jsx';

export default function App() {
  const { telemetry, policies } = useSecurity();
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL', 'SYSTEM', 'NETWORK', 'PERIPHERAL', 'TRAFFIC', 'INCIDENTS'

  const sections = [
    { id: 'ALL', label: 'FULL HUD OVERVIEW', icon: Shield },
    { id: 'SYSTEM', label: 'HARDWARE & RAM (FR-01)', icon: Activity },
    { id: 'NETWORK', label: 'NETWORK MEDIUM (FR-02)', icon: Network },
    { id: 'PERIPHERAL', label: 'USB & PERIPHERALS (FR-03)', icon: Usb },
    { id: 'TRAFFIC', label: 'EXFILTRATION RADAR (FR-04)', icon: ArrowUpRight },
    { id: 'INCIDENTS', label: 'AUDIT LOGS & POLICIES', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* DEFCON Real-Time Threat Status Banner */}
        <DefconBanner />

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 font-mono text-xs">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold uppercase tracking-wider transition whitespace-nowrap ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Section Rendering */}
        <div className="space-y-6">
          {/* Section 1: System Hardware Metrics (FR-01) */}
          {(activeSection === 'ALL' || activeSection === 'SYSTEM') && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>System Resource Monitor (FR-01)</span>
              </div>
              <SystemMonitorView system={telemetry?.system} />
            </section>
          )}

          {/* Section 2: Network Medium Classification & Topology (FR-02) */}
          {(activeSection === 'ALL' || activeSection === 'NETWORK') && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Network Medium & Topology Discovery (FR-02)</span>
              </div>
              <NetworkMediumView network={telemetry?.network} />
            </section>
          )}

          {/* Section 3: Hardware Peripheral & USB Security (FR-03 & Sec 5) */}
          {(activeSection === 'ALL' || activeSection === 'PERIPHERAL') && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Connected Devices & Peripheral Audit (FR-03 & Rogue Defense)</span>
              </div>
              <PeripheralAuditView peripherals={telemetry?.peripherals} />
            </section>
          )}

          {/* Section 4: Outbound Socket Traffic & Exfiltration Heuristics (FR-04) */}
          {(activeSection === 'ALL' || activeSection === 'TRAFFIC') && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Outbound Data Flow Inspection & Exfiltration Heuristics (FR-04)</span>
              </div>
              <TrafficInspectorView traffic={telemetry?.traffic} />
            </section>
          )}

          {/* Section 5: Security Incident Audit Log & Policy Engine */}
          {(activeSection === 'ALL' || activeSection === 'INCIDENTS') && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Forensics & Autonomous Policy Engine</span>
              </div>
              <IncidentLogView incidents={telemetry?.recentIncidents} />
              <PolicyEngineView policies={policies} />
            </section>
          )}
        </div>
      </main>

      {/* Attack Simulator Drawer */}
      <AttackSimulatorDrawer />

      {/* Bottom Telemetry Status Bar */}
      <footer className="border-t border-slate-800/80 bg-[#070b14]/90 px-6 py-2.5 font-mono text-xs text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              DAEMON SECURED: 127.0.0.1:4000
            </span>
            <span className="text-slate-600">|</span>
            <span>POLLING INTERVAL: 1000ms</span>
            <span className="text-slate-600">|</span>
            <span>DATABASE: SQLite (node:sqlite WAL)</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            <span>NetPulse OS Security Suite &copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
