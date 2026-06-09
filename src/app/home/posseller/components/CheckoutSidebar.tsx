import * as React from 'react';
import { Box } from '@mui/material';
import CheckOutRight from './checkoutRight';
import { CartItem } from '../types/cart';

export function CheckoutSidebar({ cart, total, onCheckout, discount, onDiscountChange, onPaymentChange, onTaxInvoiceChange, onEditItem, onDeleteItem }: Readonly<{
  cart: CartItem[];
  total: number;
  onCheckout: (payment: 'cash' | 'promptpay') => void;
  discount: number;
  onDiscountChange: (n: number) => void;
  onPaymentChange: (p: 'cash' | 'promptpay') => void;
  onTaxInvoiceChange: (v: 'yes' | 'no') => void;
  onEditItem: (item: CartItem) => void;
  onDeleteItem: (key: string) => void;
}>) {
  return (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <CheckOutRight
        cart={cart}
        total={total}
        onCheckout={onCheckout}
        discount={discount}
        onDiscountChange={onDiscountChange}
        onPaymentChange={onPaymentChange}
        onTaxInvoiceChange={onTaxInvoiceChange}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
      />
    </Box>
  );
}
