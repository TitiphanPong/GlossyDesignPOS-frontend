// src/types/cart.ts

export type SizeItem = {
  height: string;
  width: string;
};

export type CartItem = {
  key: string;
  name: string;
  category?: string;

  variant?: any;

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

  // โพสการ์ด
  setCount?: number; // ✅ จำนวนชุด

  // อิงค์เจ็ท
  sizeFlex?: SizeItem[];
  inkjetType?: 'canvas' | 'paper-gloss' | 'pp-board' | 'pp-banner' | 'vinyl' | 'pp-passwood' | 'backlid';


  // Sticker PVC
  stickerPVCType?: string;

  // ✅ การชำระเงิน
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;

  // ✅ อื่น ๆ (โพสการ์ด, โปสเตอร์, etc.)
  // เพิ่ม field ใหม่ได้ตรงนี้
};
