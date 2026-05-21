import * as React from 'react';
import { CartItem } from '../types/cart';
import { getCartSubtotal, getDiscountedTotal } from '../../../utils/computeTotal';

export function useCart() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [discount, setDiscount] = React.useState(0);

  const total = getCartSubtotal(cart);
  const netAfterDiscount = getDiscountedTotal(total, discount);

  return {
    cart,
    setCart,
    discount,
    setDiscount,
    total,
    netAfterDiscount,
  };
}
