import generatePayload from 'promptpay-qr';

export type PromptPayProfile = {
  target: string;
  displayName: string;
  displayIdentifier: string;
};

export type MerchantStaticQrProfile = {
  kind: 'merchant-static';
  payload: string;
  displayName: string;
  displayIdentifier: string;
};

export type PaymentQrProfile =
  | ({ kind: 'promptpay' } & PromptPayProfile)
  | MerchantStaticQrProfile;

function maskPromptPayTarget(target: string): string {
  if (target.length <= 4) return target;
  return `••••${target.slice(-4)}`;
}

function crc16CcittFalse(input: string): string {
  let crc = 0xffff;

  for (let index = 0; index < input.length; index += 1) {
    crc ^= input.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function normalizePromptPayProfile(input: Readonly<{ target?: string | null; displayName?: string | null }>): PromptPayProfile | null {
  const target = input.target?.trim() ?? '';
  const displayName = input.displayName?.trim() ?? '';

  if (!target || !displayName) return null;

  return {
    target,
    displayName,
    displayIdentifier: `PromptPay ${maskPromptPayTarget(target)}`,
  };
}

export function isValidMerchantStaticQrPayload(payload: string): boolean {
  const normalized = payload.trim();
  const crcMatch = normalized.match(/6304([0-9A-Fa-f]{4})$/u);

  if (!normalized.startsWith('000201') || !crcMatch) return false;
  if (!normalized.includes('0016A000000677010112')) return false;
  if (!normalized.includes('5303764') || !normalized.includes('5802TH')) return false;

  return crc16CcittFalse(normalized.slice(0, -4)) === crcMatch[1].toUpperCase();
}

export function normalizeMerchantStaticQrProfile(input: Readonly<{
  payload?: string | null;
  displayName?: string | null;
  displayIdentifier?: string | null;
}>): MerchantStaticQrProfile | null {
  const payload = input.payload?.trim() ?? '';
  const displayName = input.displayName?.trim() ?? '';
  const displayIdentifier = input.displayIdentifier?.trim() || 'QR ร้านค้า';

  if (!payload || !displayName || !isValidMerchantStaticQrPayload(payload)) return null;

  return {
    kind: 'merchant-static',
    payload,
    displayName,
    displayIdentifier,
  };
}

export function getPromptPayProfileFromEnv(): PromptPayProfile | null {
  return normalizePromptPayProfile({
    target: process.env.NEXT_PUBLIC_PROMPTPAY_ID,
    displayName: process.env.NEXT_PUBLIC_PROMPTPAY_DISPLAY_NAME,
  });
}

export function getPaymentQrProfileFromEnv(): PaymentQrProfile | null {
  const mode = process.env.NEXT_PUBLIC_PAYMENT_QR_MODE?.trim().toLowerCase();

  if (mode === 'merchant-static') {
    return normalizeMerchantStaticQrProfile({
      payload: process.env.NEXT_PUBLIC_PAYMENT_QR_PAYLOAD,
      displayName: process.env.NEXT_PUBLIC_PAYMENT_QR_DISPLAY_NAME,
      displayIdentifier: process.env.NEXT_PUBLIC_PAYMENT_QR_DISPLAY_IDENTIFIER,
    });
  }

  const promptpay = getPromptPayProfileFromEnv();
  return promptpay ? { kind: 'promptpay', ...promptpay } : null;
}

export function buildPaymentQrPayload(profile: PaymentQrProfile, amount: number): string {
  if (profile.kind === 'merchant-static') return profile.payload;
  return generatePayload(profile.target, { amount: normalizePromptPayAmount(amount) });
}

export function paymentQrRequiresManualAmount(profile: PaymentQrProfile): boolean {
  return profile.kind === 'merchant-static';
}

export function normalizePromptPayAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('PromptPay amount must be a finite non-negative number.');
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
