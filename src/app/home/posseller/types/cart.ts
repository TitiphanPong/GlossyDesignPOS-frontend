// src/types/cart.ts

import type { ProductVariant } from '@/lib/contracts';

export type CartItemVariant = Omit<Partial<ProductVariant>, 'name'> & {
  name: string;
  custom?: boolean;
  width: number;
  height: number;
};

export type SizeItem = {
  height: string;
  width: string;
};

export type ActiveProduct = {
  id: string;
  name: string;
  category?: string;
  code?: string;
  typeCode?: string;
};

export type ProductModalComponentProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: Partial<CartItem>;
};

export type CartItem = {
  key: string;
  name: string;
  category?: string;

  variant?: CartItemVariant;

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

  // สินค้าพรีเมียม
  typePremium?: 'roundpin' | 'shirt-screen' | 'coffee-mug' | 'acrylic-sign';

  // โพสการ์ด
  setCount?: number; // ✅ จำนวนชุด

  // อิงค์เจ็ท
  sizeFlex?: SizeItem[];
  inkjetType?: 'canvas' | 'paper-gloss' | 'pp-board' | 'pp-banner' | 'vinyl' | 'pp-passwood' | 'backlid';

  // Sticker PVC
  stickerPVCType?: string;
  plotPlanType?: string;

  // ✅ การชำระเงิน
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;

  // ✅ อื่น ๆ (โพสการ์ด, โปสเตอร์, etc.)
  // เพิ่ม field ใหม่ได้ตรงนี้
};
