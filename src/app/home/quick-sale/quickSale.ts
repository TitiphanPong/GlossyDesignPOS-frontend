export type DiscountMode = 'amount' | 'percent';

export function isDefaultVariantName(value: string): boolean {
  return value.trim().toLowerCase() === 'default';
}

export function roundMoney(value: number): number {
  const finiteValue = Number.isFinite(value) ? value : 0;
  return Math.round((finiteValue + Number.EPSILON) * 100) / 100;
}

export function calculateQuickSale(subtotal: number, discountValue: number, mode: DiscountMode) {
  const safeSubtotal = Math.max(0, roundMoney(subtotal));
  const safeDiscount = Math.max(0, Number.isFinite(discountValue) ? discountValue : 0);
  const discount = mode === 'percent' ? roundMoney((safeSubtotal * Math.min(safeDiscount, 100)) / 100) : Math.min(roundMoney(safeDiscount), safeSubtotal);
  return { subtotal: safeSubtotal, discount, grandTotal: roundMoney(safeSubtotal - discount) };
}

export function calculateChange(received: number, grandTotal: number): number {
  return roundMoney(Math.max(0, received - grandTotal));
}

export function calculateAddedVat(taxableAmount: number): number {
  return roundMoney(Math.max(0, taxableAmount) * 0.07);
}

export function calculatePayableTotal(taxableAmount: number, taxInvoice: 'yes' | 'no'): number {
  const safeTaxableAmount = Math.max(0, roundMoney(taxableAmount));
  const vatAmount = taxInvoice === 'yes' ? calculateAddedVat(safeTaxableAmount) : 0;
  return roundMoney(safeTaxableAmount + vatAmount);
}
