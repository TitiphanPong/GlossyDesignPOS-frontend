import * as React from 'react';
import { CartItem } from '../types/cart';
import { getCartSubtotal, getDiscountAmount, getDiscountedTotal, type DiscountSource } from '../../../utils/computeTotal';

export const EMPTY_DISCOUNT: DiscountSource = { type: 'amount', value: 0 };

export function useCart() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [discount, setDiscount] = React.useState<DiscountSource>(EMPTY_DISCOUNT);

  const total = getCartSubtotal(cart);
  const netAfterDiscount = getDiscountedTotal(total, getDiscountAmount(total, discount));

  return {
    cart,
    setCart,
    discount,
    setDiscount,
    total,
    netAfterDiscount,
  };
}
