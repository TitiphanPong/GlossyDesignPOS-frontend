export type ReceiptShareClientInfo = Pick<Navigator, 'userAgent' | 'maxTouchPoints'>;

export function prefersReceiptShare(client: ReceiptShareClientInfo | undefined): boolean {
  if (!client) return false;

  const userAgent = client.userAgent ?? '';
  const isiOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isiPadOSDesktopMode = /Macintosh/i.test(userAgent) && client.maxTouchPoints > 1;

  return isiOS || isAndroid || isiPadOSDesktopMode;
}

export function isShareCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function buildReceiptFileName(invoiceNumber: string): string {
  const normalizedNumber = invoiceNumber.replace(/^#/u, '').trim() || 'receipt';
  return `receipt-${normalizedNumber}.png`;
}
