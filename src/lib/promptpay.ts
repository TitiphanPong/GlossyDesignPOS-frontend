export type PromptPayProfile = {
  target: string;
  displayName: string;
  displayIdentifier: string;
};

function maskPromptPayTarget(target: string): string {
  if (target.length <= 4) return target;
  return `••••${target.slice(-4)}`;
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

export function getPromptPayProfileFromEnv(): PromptPayProfile | null {
  return normalizePromptPayProfile({
    target: process.env.NEXT_PUBLIC_PROMPTPAY_ID,
    displayName: process.env.NEXT_PUBLIC_PROMPTPAY_DISPLAY_NAME,
  });
}

export function normalizePromptPayAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('PromptPay amount must be a finite non-negative number.');
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
