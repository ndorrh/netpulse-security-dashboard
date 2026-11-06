import React from 'react';
import { Wifi, Network, Globe, RefreshCw, Server, Laptop, Cpu, Shield } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useSecurity } from '../../context/SecurityContext.jsx';

export function NetworkMediumView({ network }) {
  const { triggerScan, isScanningSubnet } = useSecurity();

  const primaryMedium = network?.primaryMedium || 'Wired (Ethernet)';
  const isWifi = primaryMedium.toLowerCase().includes('wi-fi') || primaryMedium.toLowerCase().includes('wifi');
  const gateway = network?.gateway || '192.168.1.1';
  const primaryIp = network?.primaryIp || '192.168.1.105';
  const primaryMac = network?.primaryMac || '52:54:00:12:34:56';
  const interfaces = network?.interfaces || [];
  const topology = network?.topology || [];

  const getDeviceIcon = (role = '') => {
    const text = role.toLowerCase();
    if (text.includes('gateway') || text.includes('router') || text.includes('switch')) return Network;
    if (text.includes('workstation') || text.includes('macbook') || text.includes('laptop')) return Laptop;
    if (text.includes('iot') || text.includes('sensor') || text.includes('esp')) return Cpu;
    return Server;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Network Medium Classification (FR-02) */}
      <Card
        title="Network Medium"
        subtitle="Hardware Interface Classification"
        icon={isWifi ? Wifi : Network}
        badge={
          <Badge variant={isWifi ? 'emerald' : 'blue'} size="lg" pulse>
            {primaryMedium}
          </Badge>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          {/* Main Medium Hero Display */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${isWifi ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                {isWifi ? <Wifi className="w-6 h-6" /> : <Network className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">ACTIVE CARRIER</span>
                <span className="text-base font-bold text-slate-100">{primaryMedium}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">PHYSICAL INTERFACE</span>
              <span className="text-cyan-400 font-bold">{network?.defaultInterface || 'eth0'}</span>
            </div>
          </div>

          {/* Host Addressing Parameters */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400">HOST IPv4:</span>
              <span className="text-slate-200 font-bold">{primaryIp}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400">DEFAULT GATEWAY:</span>
              <span className="text-emerald-400 font-bold">{gateway}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400">HOST HARDWARE MAC:</span>
              <span className="text-cyan-400 font-bold">{primaryMac}</span>
            </div>
          </div>

          {/* Interface Breakdown */}
          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Attached Network Adapters</span>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {interfaces.map((iface, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-950/40 border border-slate-800/60">
                  <span className="text-slate-300 font-semibold">{iface.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{iface.ip4}</span>
                    <Badge variant={iface.isWireless ? 'emerald' : iface.isVirtual ? 'slate' : 'blue'} size="sm">
                      {iface.medium}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 2 & 3. Subnet Topology Map & Neighborhood Devices (Section 1.2) */}
      <div className="lg:col-span-2">
        <Card
          title="Local Subnet Topology & Device Discovery"
          subtitle={`Discovered ${topology.length} nodes on ${gateway.replace(/\.\d+$/, '.0/24')}`}
          icon={Globe}
          badge={
            <Badge variant="cyan">
              {topology.length} NODES
            </Badge>
          }
          action={
            <button
              onClick={triggerScan}
              disabled={isScanningSubnet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningSubnet ? 'animate-spin' : ''}`} />
              <span>{isScanningSubnet ? 'SCANNING...' : 'SCAN SUBNET'}</span>
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="pb-2.5 font-semibold">Node / Role</th>
                  <th className="pb-2.5 font-semibold">IP Address</th>
                  <th className="pb-2.5 font-semibold">MAC Address</th>
                  <th className="pb-2.5 font-semibold">Hardware Vendor (OUI)</th>
                  <th className="pb-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {topology.map((node, idx) => {
                  const Icon = getDeviceIcon(node.role || node.hostname);
                  const isGateway = node.ip === gateway;
                  const isSelf = node.ip === primaryIp;

                  return (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${isGateway ? 'bg-amber-500/10 text-amber-400' : isSelf ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-300'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block truncate max-w-[150px]">
                              {node.hostname || node.role || `Node-${idx + 1}`}
                            </span>
                            {(isGateway || isSelf) && (
                              <span className="text-[9px] text-cyan-400 block">
                                {isGateway ? 'GATEWAY ROUTER' : 'THIS COMPUTER'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300 font-semibold">{node.ip}</td>
                      <td className="py-2.5 pr-3 text-slate-400">{node.mac}</td>
                      <td className="py-2.5 pr-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                          {node.vendor || 'Generic Device'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge variant={node.state === 'ONLINE' || node.state === 'REACHABLE' ? 'emerald' : 'slate'} size="sm">
                          {node.state || 'REACHABLE'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
