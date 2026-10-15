/**
 * Chrome/Edge on the cashier Mac calls the loopback-only ESC/POS print bridge.
 * An HTTPS origin can access loopback with the browser's Local Network Access
 * permission. No backend service or order mutation is involved in printing.
 */
export const THERMAL_BRIDGE_URL = 'http://127.0.0.1:18764';
export const THERMAL_BRIDGE_TOKEN_KEY = 'glossy-local-thermal-print-token';

export function isValidPairingToken(token: string): boolean {
  return /^[0-9a-f]{64}$/.test(token);
}

export async function printThermalReceipt(image: Blob, token: string): Promise<void> {
  if (!isValidPairingToken(token)) throw new Error('กรุณาตั้งค่ารหัสจับคู่เครื่องพิมพ์ 64 ตัวอักษร');
  if (image.type !== 'image/png' || image.size < 8 || image.size > 4 * 1024 * 1024) {
    throw new Error('ภาพใบเสร็จไม่ถูกต้องหรือมีขนาดใหญ่เกิน 4 MB');
  }
  let response: Response;
  try {
    response = await fetch(THERMAL_BRIDGE_URL + '/v1/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        Authorization: `Bearer ${token}`,
        'X-Glossy-Print-Id': crypto.randomUUID(),
      },
      body: image,
      signal: AbortSignal.timeout(35000),
      cache: 'no-store',
      // Chrome's Local Network Access gate needs an explicit loopback target.
      ...({ targetAddressSpace: 'loopback' } as RequestInit),
    });
  } catch {
    throw new Error('เชื่อมเครื่องพิมพ์ USB ไม่ได้: ตรวจว่า Mac mini เปิด Local Print Bridge แล้ว และอนุญาต Local Network Access ใน Chrome');
  }
  if (response.ok) return;
  if (response.status === 401) throw new Error('รหัสจับคู่เครื่องพิมพ์ไม่ถูกต้อง กรุณาตั้งค่าใหม่');
  if (response.status === 409) throw new Error('เครื่องพิมพ์กำลังรับงานอื่น กรุณาลองอีกครั้ง');
  if (response.status === 413 || response.status === 422) throw new Error('ภาพใบเสร็จไม่รองรับการพิมพ์ USB');
  throw new Error('ส่งใบเสร็จเข้าเครื่องพิมพ์ไม่สำเร็จ (HTTP ' + response.status + ')');
}
