import { Box } from '@mui/material';
import CheckOutRight from './checkoutRight';
import { CartItem } from '../types/cart';
import type { DiscountSource, TotalsResult } from '../../../utils/computeTotal';

export function CheckoutSidebar({ cart, totals, onCheckout, discount, onDiscountChange, onPaymentChange, onTaxInvoiceChange, onEditItem, onDeleteItem }: Readonly<{
  cart: CartItem[];
  totals: TotalsResult<CartItem>;
  onCheckout: (payment: 'cash' | 'promptpay') => void;
  discount: DiscountSource;
  onDiscountChange: (discount: DiscountSource) => void;
  onPaymentChange: (p: 'cash' | 'promptpay') => void;
  onTaxInvoiceChange: (v: 'yes' | 'no') => void;
  onEditItem: (item: CartItem) => void;
  onDeleteItem: (key: string) => void;
}>) {
  return (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <CheckOutRight
        cart={cart}
        totals={totals}
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
