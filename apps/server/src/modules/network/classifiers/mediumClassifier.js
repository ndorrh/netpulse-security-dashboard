import { NETWORK_MEDIUM_TYPES } from '@netpulse/shared';

export function classifyNetworkInterface(iface) {
  const name = (iface.iface || iface.name || '').toLowerCase();
  const type = (iface.type || '').toLowerCase();

  if (name.startsWith('lo') || type === 'loopback' || name.includes('docker') || name.includes('veth') || name.includes('br-')) {
    return {
      category: NETWORK_MEDIUM_TYPES.LOOPBACK,
      isWireless: false,
      isWired: false,
      isVirtual: true,
      badgeColor: 'slate'
    };
  }

  // Check for Wi-Fi indicators
  if (
    type === 'wireless' ||
    type === 'wifi' ||
    name.startsWith('wl') ||
    name.startsWith('wlan') ||
    name.startsWith('wi-fi') ||
    name.includes('airport') ||
    name.includes('wireless')
  ) {
    return {
      category: NETWORK_MEDIUM_TYPES.WIFI,
      isWireless: true,
      isWired: false,
      isVirtual: false,
      badgeColor: 'emerald'
    };
  }

  // Check for Wired Ethernet indicators
  if (
    type === 'wired' ||
    type === 'ethernet' ||
    name.startsWith('eth') ||
    name.startsWith('en') ||
    name.startsWith('em') ||
    name.startsWith('eno') ||
    name.startsWith('ens') ||
    name.startsWith('enp')
  ) {
    return {
      category: NETWORK_MEDIUM_TYPES.ETHERNET,
      isWireless: false,
      isWired: true,
      isVirtual: false,
      badgeColor: 'blue'
    };
  }

  return {
    category: NETWORK_MEDIUM_TYPES.UNKNOWN,
    isWireless: false,
    isWired: false,
    isVirtual: false,
    badgeColor: 'gray'
  };
}
