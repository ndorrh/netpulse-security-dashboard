import React, { useState } from 'react';
import { Usb, ShieldCheck, ShieldAlert, CheckCircle, Trash2, Plus, AlertOctagon, Key, BatteryCharging, HardDrive } from 'lucide-react';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { useSecurity } from '../../context/SecurityContext.jsx';

export function PeripheralAuditView({ peripherals }) {
  const { trustDevice, deleteWhitelist, whitelist, refreshWhitelist } = useSecurity();
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [manualVid, setManualVid] = useState('');
  const [manualPid, setManualPid] = useState('');
  const [manualName, setManualName] = useState('');

  const connected = peripherals?.connected || [];
  const untrustedCount = peripherals?.untrustedCount || 0;
  const hasRogue = untrustedCount > 0;

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualVid || !manualPid) return;
    await trustDevice(manualVid, manualPid, manualName || 'Manually Authorized Device', 'Custom');
    setManualVid('');
    setManualPid('');
    setManualName('');
  };

  const getDeviceIcon = (dev) => {
    if (dev.isBadUsb) return Key;
    if (dev.isSpoofedCharger) return BatteryCharging;
    if (dev.deviceClass === 'Mass Storage') return HardDrive;
    return Usb;
  };

  return (
    <div className="space-y-4">
      <Card
        title="Connected Devices & Hardware Peripherals"
        subtitle="USB Bus Enumeration & SQLite Whitelist Enforcement"
        icon={Usb}
        borderGlow={hasRogue ? 'red' : 'none'}
        badge={
          <Badge variant={hasRogue ? 'red' : 'emerald'} pulse={hasRogue} size="lg">
            {hasRogue ? `${untrustedCount} ROGUE / UNTRUSTED` : 'ALL PERIPHERALS TRUSTED'}
          </Badge>
        }
        action={
          <button
            onClick={() => {
              refreshWhitelist();
              setIsWhitelistModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-semibold transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>MANAGE WHITELIST ({whitelist.length})</span>
          </button>
        }
      >
        {/* Rogue Device Warning Banner if active */}
        {hasRogue && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/80 shadow-[0_0_15px_rgba(255,0,60,0.2)] animate-pulse flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="font-mono text-xs">
              <span className="font-bold text-red-300 block uppercase tracking-wider text-sm">
                CRITICAL PERIPHERAL SECURITY ALERT
              </span>
              <p className="text-red-200 mt-0.5">
                One or more unauthorized peripherals connected to USB bus! Potential physical attack (BadUSB injection, rogue charger exfiltration tap, or unverified storage mount).
              </p>
            </div>
          </div>
        )}

        {/* Connected Peripherals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2.5 font-semibold">Device / Manufacturer</th>
                <th className="pb-2.5 font-semibold">Hardware IDs</th>
                <th className="pb-2.5 font-semibold">Serial Number</th>
                <th className="pb-2.5 font-semibold">Device Class</th>
                <th className="pb-2.5 font-semibold">Trust State</th>
                <th className="pb-2.5 font-semibold text-right">Defense Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {connected.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No external USB peripherals currently attached.
                  </td>
                </tr>
              ) : (
                connected.map((dev, idx) => {
                  const Icon = getDeviceIcon(dev);
                  const isUntrusted = dev.isRogue;

                  return (
                    <tr
                      key={idx}
                      className={`transition ${isUntrusted ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-slate-900/40'}`}
                    >
                      {/* Name & Manufacturer */}
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${isUntrusted ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-cyan-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block truncate max-w-[200px]">
                              {dev.name || 'USB Device'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {dev.manufacturer || 'Generic Vendor'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hardware VID / PID */}
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-[11px]">
                            VID: 0x{dev.vid}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-300 font-bold text-[11px]">
                            PID: 0x{dev.pid}
                          </span>
                        </div>
                      </td>

                      {/* Serial */}
                      <td className="py-3 pr-3 text-slate-400 text-[11px] truncate max-w-[130px]">
                        {dev.serialNumber || 'N/A'}
                      </td>

                      {/* Class */}
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${isUntrusted && (dev.deviceClass === 'Mass Storage' || dev.isBadUsb || dev.isSpoofedCharger) ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-300'}`}>
                          {dev.deviceClass}
                        </span>
                      </td>

                      {/* Trust State */}
                      <td className="py-3 pr-3">
                        {isUntrusted ? (
                          <div className="space-y-1">
                            <Badge variant="red" pulse size="sm">
                              UNTRUSTED / ROGUE
                            </Badge>
                            {dev.threatReasons?.length > 0 && (
                              <span className="text-[9px] text-red-400 block max-w-[220px] truncate" title={dev.threatReasons.join(' | ')}>
                                {dev.threatReasons[0]}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="emerald" size="sm">
                            WHITELISTED
                          </Badge>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 text-right">
                        {isUntrusted ? (
                          <button
                            onClick={() => trustDevice(dev.vid, dev.pid, dev.name, dev.deviceClass)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>TRUST DEVICE</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Authorized</span>
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

      {/* SQLite Whitelist Manager Modal */}
      <Modal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
        title="SQLite Trusted Peripheral Whitelist"
        icon={ShieldCheck}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 font-mono text-xs">
          {/* Add Manual Form */}
          <form onSubmit={handleManualAdd} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
              Authorize New Hardware Fingerprint
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">VENDOR ID (VID)</label>
                <input
                  type="text"
                  placeholder="e.g. 1d6b"
                  value={manualVid}
                  onChange={(e) => setManualVid(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PRODUCT ID (PID)</label>
                <input
                  type="text"
                  placeholder="e.g. 0002"
                  value={manualPid}
                  onChange={(e) => setManualPid(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">DEVICE ALIAS / NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Dev Workstation YubiKey"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>ADD TO SQLITE WHITELIST</span>
            </button>
          </form>

          {/* Current Whitelisted Database Entries */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                Active Whitelist Records ({whitelist.length})
              </span>
              <span className="text-[10px] text-slate-500">Stored in netpulse.db</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/40">
              {whitelist.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{item.product_name || item.vendor_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-[10px]">
                        0x{item.vid}:0x{item.pid}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Class: {item.device_class || 'Generic'} | Notes: {item.notes || 'Authorized'}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteWhitelist(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Revoke Trust"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
