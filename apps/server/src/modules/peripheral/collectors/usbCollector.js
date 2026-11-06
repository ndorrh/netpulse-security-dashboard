import si from 'systeminformation';
import fs from 'node:fs';
import path from 'node:path';

export async function readHostUsbDevices() {
  const devices = [];

  // 1. Try systeminformation
  try {
    const siUsb = await si.usb().catch(() => []);
    if (siUsb && siUsb.length > 0) {
      for (const dev of siUsb) {
        devices.push({
          bus: String(dev.bus || '1'),
          device: String(dev.device || '1'),
          vid: String(dev.vendorId || dev.idVendor || '1d6b').toLowerCase(),
          pid: String(dev.productId || dev.idProduct || '0002').toLowerCase(),
          name: dev.name || dev.product || 'Unknown USB Device',
          manufacturer: dev.vendor || dev.manufacturer || 'Generic',
          serialNumber: dev.serialNumber || 'N/A',
          deviceClass: inferDeviceClass(dev.name, dev.type)
        });
      }
    }
  } catch (err) {
    // Continue to sysfs fallback
  }

  // 2. Try direct Linux sysfs (/sys/bus/usb/devices)
  if (devices.length === 0 && fs.existsSync('/sys/bus/usb/devices')) {
    try {
      const entries = fs.readdirSync('/sys/bus/usb/devices');
      for (const entry of entries) {
        const devPath = path.join('/sys/bus/usb/devices', entry);
        const idVendorFile = path.join(devPath, 'idVendor');
        const idProductFile = path.join(devPath, 'idProduct');

        if (fs.existsSync(idVendorFile) && fs.existsSync(idProductFile)) {
          const vid = fs.readFileSync(idVendorFile, 'utf8').trim().toLowerCase();
          const pid = fs.readFileSync(idProductFile, 'utf8').trim().toLowerCase();
          const productFile = path.join(devPath, 'product');
          const manufacturerFile = path.join(devPath, 'manufacturer');
          const serialFile = path.join(devPath, 'serial');

          const product = fs.existsSync(productFile) ? fs.readFileSync(productFile, 'utf8').trim() : 'USB Device';
          const manufacturer = fs.existsSync(manufacturerFile) ? fs.readFileSync(manufacturerFile, 'utf8').trim() : 'Generic';
          const serialNumber = fs.existsSync(serialFile) ? fs.readFileSync(serialFile, 'utf8').trim() : 'N/A';

          devices.push({
            bus: entry,
            device: entry,
            vid,
            pid,
            name: product,
            manufacturer,
            serialNumber,
            deviceClass: inferDeviceClass(product, '')
          });
        }
      }
    } catch (err) {
      // Ignore
    }
  }

  return devices;
}

function inferDeviceClass(name = '', type = '') {
  const text = `${name} ${type}`.toLowerCase();
  if (text.includes('storage') || text.includes('flash') || text.includes('disk') || text.includes('drive')) {
    return 'Mass Storage';
  }
  if (text.includes('keyboard') || text.includes('mouse') || text.includes('hid') || text.includes('pointer')) {
    return 'HID Peripheral';
  }
  if (text.includes('ethernet') || text.includes('wireless') || text.includes('adapter') || text.includes('network')) {
    return 'Network Interface';
  }
  if (text.includes('hub') || text.includes('root hub')) {
    return 'USB Hub';
  }
  if (text.includes('camera') || text.includes('video') || text.includes('webcam')) {
    return 'Video/Imaging';
  }
  if (text.includes('audio') || text.includes('speaker') || text.includes('headset') || text.includes('microphone')) {
    return 'Audio Interface';
  }
  return 'Generic Peripheral';
}
