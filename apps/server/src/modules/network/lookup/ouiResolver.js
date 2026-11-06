const KNOWN_OUIs = {
  '00:0c:29': 'VMware',
  '00:50:56': 'VMware',
  '52:54:00': 'QEMU / KVM Virtual NIC',
  '08:00:27': 'Oracle VirtualBox',
  '00:1a:11': 'Google LLC',
  'dc:a6:32': 'Raspberry Pi Foundation',
  'b8:27:eb': 'Raspberry Pi Foundation',
  'e4:5f:01': 'Raspberry Pi Trading',
  '28:cd:c1': 'Apple, Inc.',
  '3c:22:fb': 'Apple, Inc.',
  'ac:bc:32': 'Apple, Inc.',
  'f0:18:98': 'Apple, Inc.',
  'a4:83:e7': 'Apple, Inc.',
  'bc:d0:74': 'Samsung Electronics',
  '00:1e:67': 'Intel Corporation',
  '00:21:6a': 'Intel Corporation',
  '80:86:f2': 'Intel Corporation',
  '00:15:5d': 'Microsoft Corporation (Hyper-V)',
  '00:25:90': 'Super Micro Computer',
  'd8:5e:d3': 'Cisco Systems',
  '00:26:08': 'Cisco Systems',
  '00:1d:7e': 'Cisco-Linksys',
  '50:c7:bf': 'TP-Link Corporation',
  'ec:08:6b': 'TP-Link Corporation',
  '30:ae:a4': 'Espressif Systems (ESP32/ESP8266 IoT)',
  '24:6f:28': 'Espressif Systems (IoT)',
  '18:fe:34': 'Espressif Systems',
  '48:3f:da': 'Ubiquiti Networks',
  'f0:9f:c2': 'Ubiquiti Networks'
};

export function resolveMacVendor(mac) {
  if (!mac || typeof mac !== 'string') return 'Unknown Vendor';
  const clean = mac.toLowerCase().replace(/[:-]/g, ':');
  const prefix = clean.slice(0, 8);

  if (KNOWN_OUIs[prefix]) {
    return KNOWN_OUIs[prefix];
  }

  // Common heuristics
  if (clean.startsWith('00:00:00') || clean === 'ff:ff:ff:ff:ff:ff') {
    return 'Broadcast / Virtual';
  }

  return 'Generic Hardware Vendor';
}
