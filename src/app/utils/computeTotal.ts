// src/utils/computeTotals.ts

import { CartItem } from '../home/posseller/types/cart';

export interface TotalsResult {
  total: number; // ราคาก่อนส่วนลด
  discountAmount: number; // มูลค่าส่วนลด
  finalTotal: number; // หลังหักส่วนลด
  vatAmount: number; // VAT 7%
  grandTotal: number; // ยอดรวมสุทธิ (finalTotal + vatAmount)
  adjustedCart: CartItem[]; // cart ที่ปรับแล้ว
  depositTotal: number; // ยอดที่จ่ายตอนนี้
  remainingTotal: number; // ยอดค้าง
}

export function computeTotals(
  cart: CartItem[],
  discount: number, // เป็น "มูลค่าส่วนลด" ที่คำนวณแล้ว
  taxInvoice: 'yes' | 'no'
): TotalsResult {
  // 1) รวมราคาก่อนส่วนลด
  const total = cart.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.qty || 0), 0);

  // 2) ส่วนลด
  const discountAmount = Math.min(discount, total);
  const finalTotal = Math.max(total - discountAmount, 0);

  // 3) VAT
  const vatAmount = taxInvoice === 'yes' ? finalTotal * 0.07 : 0;

  // 4) grand total
  const grandTotal = finalTotal + vatAmount;

  // 5) แจกแจงราคาลงสินค้า
  const adjustedCart: CartItem[] = [];
  let depositTotal = 0;
  let remainingTotal = 0;

  cart.forEach(item => {
    const itemPrice = Number(item.unitPrice) * Number(item.qty || 0);
    const ratio = total > 0 ? itemPrice / total : 0;

    const discountedItemPrice = grandTotal * ratio;

    if (item.fullPayment) {
      adjustedCart.push({
        ...item,
        totalPrice: discountedItemPrice,
        deposit: discountedItemPrice,
        remaining: 0,
      });
      depositTotal += discountedItemPrice;
    } else {
      const scale = itemPrice > 0 ? discountedItemPrice / itemPrice : 0;
      const deposit = (item.deposit || 0) * scale;
      const remaining = (item.remaining || 0) * scale;

      adjustedCart.push({
        ...item,
        totalPrice: discountedItemPrice,
        deposit,
        remaining,
      });
      depositTotal += deposit;
      remainingTotal += remaining;
    }
  });

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
