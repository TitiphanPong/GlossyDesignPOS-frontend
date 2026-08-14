export type DiscountMode = 'amount' | 'percent';

export function isDefaultVariantName(value: string): boolean {
  return value.trim().toLowerCase() === 'default';
}

export function roundMoney(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function calculateQuickSale(subtotal: number, discountValue: number, mode: DiscountMode) {
  const safeSubtotal = Math.max(0, roundMoney(subtotal));
  const safeDiscount = Math.max(0, Number.isFinite(discountValue) ? discountValue : 0);
  const discount = mode === 'percent'
    ? roundMoney(safeSubtotal * Math.min(safeDiscount, 100) / 100)
    : Math.min(roundMoney(safeDiscount), safeSubtotal);
  return { subtotal: safeSubtotal, discount, grandTotal: roundMoney(safeSubtotal - discount) };
}

export function calculateChange(received: number, grandTotal: number): number {
  return roundMoney(Math.max(0, received - grandTotal));
}

export function calculateInclusiveVat(grandTotal: number): number {
  return roundMoney((Math.max(0, grandTotal) * 7) / 107);
}
