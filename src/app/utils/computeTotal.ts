import type { CartItem } from '../home/posseller/types/cart';
import type { OrderDiscountInput } from '../../lib/contracts';

type TaxInvoiceValue = 'yes' | 'no';

export type DiscountSource = OrderDiscountInput;

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
  adjustedCart: Array<TCartItem & { totalPrice: number; deposit: number; remaining: number }>;
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
  const finiteValue = Number.isFinite(value) ? value : 0;
  return Math.round((finiteValue + Number.EPSILON) * 100) / 100;
}

export function getCartSubtotal<TCartItem extends CartPricingItem>(cart: TCartItem[]): number {
  return roundCurrency(cart.reduce((sum, item) => sum + roundCurrency(Number(item.unitPrice || 0)) * Number(item.qty || 0), 0));
}

export function getDiscountedTotal(total: number, discount: number): number {
  const safeTotal = roundCurrency(total);
  const discountAmount = Math.min(roundCurrency(Math.max(discount, 0)), safeTotal);
  return roundCurrency(Math.max(safeTotal - discountAmount, 0));
}

export function getDiscountAmount(total: number, discount: DiscountSource | number): number {
  const safeTotal = Math.max(roundCurrency(total), 0);
  if (typeof discount === 'number') {
    return Math.min(roundCurrency(Math.max(discount, 0)), safeTotal);
  }

  const safeValue = Number.isFinite(discount.value) ? Math.max(discount.value, 0) : 0;
  if (discount.type === 'percent') {
    const basisPoints = Math.min(Math.round((safeValue + Number.EPSILON) * 100), 10_000);
    return roundCurrency((safeTotal * basisPoints) / 10_000);
  }

  return Math.min(roundCurrency(safeValue), safeTotal);
}

export function computeTotals<TCartItem extends CartPricingItem>(cart: TCartItem[], discount: DiscountSource | number, taxInvoice: TaxInvoiceValue): TotalsResult<TCartItem> {
  const total = getCartSubtotal(cart);
  const discountAmount = getDiscountAmount(total, discount);
  const finalTotal = getDiscountedTotal(total, discountAmount);
  const vatAmount = taxInvoice === 'yes' ? roundCurrency(finalTotal * 0.07) : 0;
  const grandTotal = roundCurrency(finalTotal + vatAmount);

  let allocatedNet = 0;
  let allocatedGross = 0;
  const adjustedCart = cart.map((item, index) => {
    const itemSubtotal = roundCurrency(roundCurrency(Number(item.unitPrice || 0)) * Number(item.qty || 0));
    const ratio = total > 0 ? itemSubtotal / total : 0;
    const isLastItem = index === cart.length - 1;
    const itemNetAfterDiscount = isLastItem ? roundCurrency(finalTotal - allocatedNet) : roundCurrency(finalTotal * ratio);
    const itemGross = isLastItem ? roundCurrency(grandTotal - allocatedGross) : roundCurrency(grandTotal * ratio);
    allocatedNet = roundCurrency(allocatedNet + itemNetAfterDiscount);
    allocatedGross = roundCurrency(allocatedGross + itemGross);

    if (item.fullPayment) {
      return {
        ...item,
        totalPrice: itemNetAfterDiscount,
        deposit: itemGross,
        remaining: 0,
      };
    }

    const originalDeposit = Math.max(0, Number(item.deposit || 0));
    const originalRemaining = Math.max(0, Number(item.remaining || 0));
    const originalPaymentBase = originalDeposit + originalRemaining;
    const itemDeposit = originalPaymentBase > 0 ? roundCurrency((itemGross * originalDeposit) / originalPaymentBase) : 0;

    return {
      ...item,
      totalPrice: itemNetAfterDiscount,
      deposit: itemDeposit,
      remaining: roundCurrency(itemGross - itemDeposit),
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
