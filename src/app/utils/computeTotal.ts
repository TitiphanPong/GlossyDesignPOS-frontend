import { CartItem } from '../home/posseller/types/cart';

type TaxInvoiceValue = 'yes' | 'no';

export type CartPricingItem = {
  qty?: number;
  unitPrice?: number;
  totalPrice?: number;
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;
};

export interface TotalsResult<TCartItem extends CartPricingItem = CartItem> {
  total: number;
  discountAmount: number;
  finalTotal: number;
  vatAmount: number;
  grandTotal: number;
  adjustedCart: TCartItem[];
  depositTotal: number;
  remainingTotal: number;
}

export interface PaymentSummaryResult {
  subtotal: number;
  discount: number;
  netTotal: number;
  vat: number;
  grandTotal: number;
  deposit: number;
  remaining: number;
  hasDeposit: boolean;
  amountToPay: number;
}

type OrderLike<TCartItem extends CartPricingItem = CartPricingItem> = {
  total?: number;
  discount?: number;
  taxInvoice?: TaxInvoiceValue;
  vatAmount?: number;
  grandTotal?: number;
  remainingTotal?: number;
  cart?: TCartItem[];
};

export function roundCurrency(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function getCartSubtotal<TCartItem extends CartPricingItem>(cart: TCartItem[]): number {
  return roundCurrency(cart.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.qty || 0), 0));
}

export function getDiscountedTotal(total: number, discount: number): number {
  const safeTotal = roundCurrency(total);
  const discountAmount = Math.min(roundCurrency(Math.max(discount, 0)), safeTotal);
  return roundCurrency(Math.max(safeTotal - discountAmount, 0));
}

export function computeTotals<TCartItem extends CartPricingItem>(cart: TCartItem[], discount: number, taxInvoice: TaxInvoiceValue): TotalsResult<TCartItem> {
  const total = getCartSubtotal(cart);
  const discountAmount = roundCurrency(Math.min(Math.max(discount, 0), total));
  const finalTotal = getDiscountedTotal(total, discountAmount);
  const vatAmount = taxInvoice === 'yes' ? roundCurrency(finalTotal * 0.07) : 0;
  const grandTotal = roundCurrency(finalTotal + vatAmount);

  const adjustedCart = cart.map(item => {
    const itemSubtotal = roundCurrency(Number(item.unitPrice || 0) * Number(item.qty || 0));
    const ratio = total > 0 ? itemSubtotal / total : 0;
    const itemNetAfterDiscount = roundCurrency(finalTotal * ratio);
    const itemVat = taxInvoice === 'yes' ? roundCurrency(itemNetAfterDiscount * 0.07) : 0;
    const itemGross = roundCurrency(itemNetAfterDiscount + itemVat);

    if (item.fullPayment) {
      return {
        ...item,
        totalPrice: itemNetAfterDiscount,
        deposit: itemGross,
        remaining: 0,
      };
    }

    const safeBase = itemSubtotal || 1;
    const scale = itemGross / safeBase;

    return {
      ...item,
      totalPrice: itemNetAfterDiscount,
      deposit: roundCurrency(Number(item.deposit || 0) * scale),
      remaining: roundCurrency(Number(item.remaining || 0) * scale),
    };
  });

  const depositTotal = roundCurrency(adjustedCart.reduce((sum, item) => sum + Number(item.deposit || 0), 0));
  const remainingTotal = roundCurrency(adjustedCart.reduce((sum, item) => sum + Number(item.remaining || 0), 0));

  return {
    total,
    discountAmount,
    finalTotal,
    vatAmount,
    grandTotal,
    adjustedCart,
    depositTotal,
    remainingTotal,
  };
}

export function computeOrderPaymentSummary<TCartItem extends CartPricingItem>(order: OrderLike<TCartItem>): PaymentSummaryResult {
  const subtotal = roundCurrency(order.total ?? 0);
  const discount = roundCurrency(order.discount ?? 0);
  const netTotal = getDiscountedTotal(subtotal, discount);
  const vat = order.taxInvoice === 'yes' ? roundCurrency(order.vatAmount ?? netTotal * 0.07) : 0;
  const grandTotal = roundCurrency(order.grandTotal ?? netTotal + vat);
  const cart = order.cart ?? [];
  const deposit = roundCurrency(cart.reduce((sum, item) => sum + Number(item.deposit || 0), 0));
  const remaining = roundCurrency(cart.reduce((sum, item) => sum + Number(item.remaining || 0), 0));
  const hasDeposit = remaining > 0 || cart.some(item => !item.fullPayment && Number(item.deposit || 0) > 0);
  const amountToPay = hasDeposit && deposit > 0 ? deposit : grandTotal;

  return {
    subtotal,
    discount,
    netTotal,
    vat,
    grandTotal,
    deposit,
    remaining,
    hasDeposit,
    amountToPay: roundCurrency(amountToPay),
  };
}
