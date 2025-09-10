// src/types/cart.ts

export type CartItem = {
  key: string;
  name: string;
  category?: string;

  variant: any;

  qty: number;
  unitPrice: number;
  totalPrice: number;

  // ✅ รายละเอียดสินค้า
  productNote?: string;

  // นามบัตร
  material?: string;
  sides?: string;
  colorMode?: string;

  // ตรายาง

  type?: 'normal' | 'inked';
  shape?: 'circle' | 'square';
  size?: string;

  // ✅ การชำระเงิน
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;

  // ✅ อื่น ๆ (โพสการ์ด, โปสเตอร์, etc.)
  // เพิ่ม field ใหม่ได้ตรงนี้
};
