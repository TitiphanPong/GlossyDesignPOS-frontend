export function normalizePromptPayAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('PromptPay amount must be a finite non-negative number.');
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
