import * as React from 'react';
import { CartItem } from '../types/cart';

export function useCart() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [discount, setDiscount] = React.useState(0);

  const total = cart.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.qty || 0), 0);
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const netAfterDiscount = round2(Math.max(total - discount, 0));

  return {
    cart,
    setCart,
    discount,
    setDiscount,
    total,
    netAfterDiscount,
  };
}
