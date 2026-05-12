'use client';

import React, { useEffect, useState } from 'react';
import styles from './checkoutRight.module.css';
import ButtonEdit from './buttonEdit';
import ButtonDelete from './buttonDelete';

type CartItem = {
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

  // สินค้าพรีเมียม
  typePremium?: 'roundpin' | 'shirt-screen' | 'coffee-mug' | 'acrylic-sign';

  // โพสการ์ด
  setCount?: number; // ✅ จำนวนชุด

  // อิงค์เจ็ท
  sizeFlex?: { height: string; width: string }[]; // ✅ เพิ่มเข้าไป
  inkjetType?: 'paper-gloss' | 'pp-board' | 'pp-banner' | 'vinyl' | 'pp-passwood' | 'backlid' | 'canvas';

  // StickerPVC
  stickerPVCType?: string;

  // ✅ การชำระเงิน
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;
};

type Props = {
  cart: CartItem[];
  total: number;
  discount: number;
  onCheckout: (payment: 'cash' | 'promptpay') => void;
  onDiscountChange?: (discount: number) => void;
  onPaymentChange?: (payment: 'cash' | 'promptpay') => void;
  onTaxInvoiceChange?: (value: 'yes' | 'no') => void; // ✅ เพิ่มเข้ามา

  onEditItem?: (item: CartItem) => void;
  onDeleteItem?: (key: string) => void;
};

const premiumTypeLabel = (typePremium?: CartItem['typePremium']) => {
  switch (typePremium) {
    case 'roundpin':
      return 'เข็มกลัด';
    case 'shirt-screen':
      return 'สกรีนเสื้อ';
    case 'coffee-mug':
      return 'สกรีนแก้ว';
    case 'acrylic-sign':
      return 'ป้ายอะคลิลิก';
    default:
      return 'ไม่ระบุ';
  }
};

const inkjetTypeLabel = (inkjetType?: CartItem['inkjetType']) => {
  switch (inkjetType) {
    case 'paper-gloss':
      return 'PAPER GLOSS';
    case 'pp-board':
      return 'PP + BOARD';
    case 'pp-banner':
      return 'PP BANNER';
    case 'vinyl':
      return 'VINYL';
    case 'pp-passwood':
      return 'PP + PASSWOOD';
    case 'backlid':
      return 'BACKLID';
    case 'canvas':
      return 'CANVAS';
    default:
      return 'ไม่ระบุ';
  }
};

function CategoryDetails({ item }: Readonly<{ item: CartItem }>) {
  return (
    <>
      {item.category === 'นามบัตร' && (
        <>
          <li>📦 ขนาด : {item.variant?.custom ? `${item.variant?.width} × ${item.variant?.height} mm` : item.variant?.name || 'ไม่ระบุ'}</li>
          <li>📄 วัสดุ : {item.material || 'ไม่ระบุ'}</li>
          <li>🖨️ พิมพ์ : {item.sides === '2' ? '2 ด้าน' : '1 ด้าน'}</li>
          <li>🎨 โหมดสี : {item.colorMode === 'bw' ? 'ขาวดำ' : 'สี'}</li>
          <li>📝 รายละเอียด : {item.productNote || 'ไม่ระบุ'}</li>
        </>
      )}

      {item.category === 'ตรายาง' && (
        <>
          <li>🪧 ประเภท : {item.type === 'inked' ? 'หมึกในตัว' : 'ธรรมดา'}</li>
          <li>🔲 รูปทรง : {item.shape === 'circle' ? 'วงกลม' : 'สี่เหลี่ยม'}</li>
          <li>📏 ขนาด : {item.size || 'ไม่ระบุ'}</li>
          <li>📝 รายละเอียด : {item.productNote || 'ไม่ระบุ'}</li>
        </>
      )}

      {item.category === 'สินค้าพรีเมียม' && (
        <>
          <li>🪧 ประเภท : {premiumTypeLabel(item.typePremium)}</li>
          {item.shape && <li>🔲 รูปทรง : {item.shape === 'circle' ? 'วงกลม' : 'สี่เหลี่ยม'}</li>}
          <li>📏 ขนาด : {item.size || 'ไม่ระบุ'}</li>
          <li>📝 รายละเอียด : {item.productNote || 'ไม่ระบุ'}</li>
        </>
      )}

      {item.category === 'ปริ้นท์เอกสาร' && (
        <>
          <li>📦 ขนาด : {item.variant?.custom ? `${item.variant?.width} × ${item.variant?.height} mm` : item.variant?.name || 'ไม่ระบุ'}</li>
          <li>📄 ชนิดกระดาษ : {item.material || 'ไม่ระบุ'}</li>
          <li>🖨️ พิมพ์ : {item.sides === '2' ? '2 ด้าน' : '1 ด้าน'}</li>
          <li>🎨 โหมดสี : {item.colorMode === 'bw' ? 'ขาวดำ' : 'สี'}</li>
          <li>📝 รายละเอียด : {item.productNote || 'ไม่ระบุ'}</li>
        </>
      )}

      {item.category === 'โพสการ์ด' && (
        <>
          <li>📦 ขนาด : {item.variant?.custom ? `${item.variant?.width} × ${item.variant?.height} นิ้ว` : item.variant?.name || 'ไม่ระบุ'}</li>
          <li>📄 ชนิดกระดาษ : {item.material || 'ไม่ระบุ'}</li>
          <li>🗂️ จำนวนชุด : {item.setCount || '-'} ชุด</li>
        </>
      )}

      {item.category === 'อิงค์เจ็ท' && (
        <>
          <li>
            📐 ขนาด :
            {item.sizeFlex && item.sizeFlex.length > 0 ? (
              <ul style={{ marginLeft: '1.5rem' }}>
                {item.sizeFlex.map(sz => (
                  <li key={`${sz.width}-${sz.height}`}>
                    {sz.width} × {sz.height} mm
                  </li>
                ))}
              </ul>
            ) : (
              'ไม่ระบุ'
            )}
          </li>
          <li>🪧 ชนิดวัสดุ : {inkjetTypeLabel(item.inkjetType)}</li>
          {item.productNote && <li>📝 รายละเอียด : {item.productNote}</li>}
        </>
      )}
    </>
  );
}

function NamedProductDetails({ item }: Readonly<{ item: CartItem }>) {
  return (
    <>
      {item.name === 'สติ๊กเกอร์ PVC Inkjet' && (
        <>
          <li>
            📐 ขนาด :
            {item.sizeFlex && item.sizeFlex.length > 0 ? (
              <ul style={{ marginLeft: '1.5rem' }}>
                {item.sizeFlex.map(sz => (
                  <li key={`${sz.width}-${sz.height}`}>
                    {sz.width} × {sz.height} mm
                  </li>
                ))}
              </ul>
            ) : (
              'ไม่ระบุ'
            )}
          </li>
          <li>🎨 ชนิดสติ๊กเกอร์ : {item.stickerPVCType || 'ไม่ระบุ'}</li>
          <li>🔢 จำนวน : {item.qty || 0} ชิ้น</li>
          <li>📝 รายละเอียด : {item.productNote || 'ไม่ระบุ'}</li>
        </>
      )}

      {item.name === 'สติ๊กเกอร์ PP Laser' && (
        <>
          <li>📦 ขนาด : {item.variant?.custom ? `${item.variant?.width} × ${item.variant?.height} mm` : item.variant?.name || 'ไม่ระบุ'}</li>
          <li>📝 รายละเอียด : {item.productNote || 'ไม่ระบุ'}</li>
        </>
      )}
    </>
  );
}

function CartItemDetailsList({ item }: Readonly<{ item: CartItem }>) {
  return (
    <>
      <CategoryDetails item={item} />
      <NamedProductDetails item={item} />

      <li style={{ whiteSpace: 'nowrap' }}>
        💰 การชำระ :{' '}
        {item.fullPayment ? `เต็มจำนวน (${Number(item.totalPrice).toFixed(2)}฿)` : `มัดจำ ${Number(item.deposit || 0).toFixed(2)}฿ (คงเหลือ ${Number(item.remaining || 0).toFixed(2)}฿)`}
      </li>
    </>
  );
}

const CheckOutRight: React.FC<Props> = ({ cart, total, discount, onCheckout, onDiscountChange, onPaymentChange, onEditItem, onDeleteItem, onTaxInvoiceChange }) => {
  const [discountInput, setDiscountInput] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | null>(null);
  const [payment, setPayment] = useState<'cash' | 'promptpay'>('cash');
  const [taxInvoice, setTaxInvoice] = useState<'yes' | 'no'>('no');

  useEffect(() => {
    if (discount === 0) {
      setDiscountInput('');
      setDiscountValue(0);
      setDiscountType(null);
    }
  }, [discount]);

  // ✅ ยอดสุทธิหลังส่วนลด
  let finalTotal = total;
  if (discountType === 'percent') {
    finalTotal = total - (total * discountValue) / 100;
  } else if (discountType === 'fixed') {
    finalTotal = Math.max(total - discountValue, 0);
  }

  // ✅ คำนวณ VAT และยอดสุทธิ
  const vatAmount = taxInvoice === 'yes' ? finalTotal * 0.07 : 0;
  const grandTotal = finalTotal + vatAmount;

  // ✅ กระจายส่วนลดลงสินค้าใน cart
  let totalDeposit = 0;
  let totalRemaining = 0;

  cart.forEach(item => {
    const itemPrice = item.totalPrice || 0;
    const ratio = total > 0 ? itemPrice / total : 0;
    const discountedItemPrice = grandTotal * ratio;

    if (item.fullPayment) {
      totalDeposit += discountedItemPrice;
    } else {
      const scale = discountedItemPrice / itemPrice;
      const depositPart = (item.deposit || 0) * scale;
      const remainingPart = (item.remaining || 0) * scale;

      totalDeposit += depositPart;
      totalRemaining += remainingPart;
    }
  });

  const handleApplyDiscount = () => {
    const value = discountInput.trim();

    if (!value) {
      setDiscountValue(0);
      setDiscountType(null);
      onDiscountChange?.(0);
      return;
    }

    if (value.endsWith('%')) {
      const percent = Number.parseFloat(value.replace('%', ''));
      if (!Number.isNaN(percent) && percent >= 0 && percent <= 100) {
        setDiscountValue(percent);
        setDiscountType('percent');
        onDiscountChange?.((total * percent) / 100);
      } else {
        alert('กรุณากรอกเปอร์เซ็นต์ 0-100%');
      }
    } else if (value.startsWith('-')) {
      const fixed = Number.parseFloat(value.replace('-', ''));
      if (!Number.isNaN(fixed) && fixed > 0) {
        setDiscountValue(fixed);
        setDiscountType('fixed');
        onDiscountChange?.(fixed);
      } else {
        alert('กรุณากรอกจำนวนเงินที่ถูกต้อง เช่น -20');
      }
    } else {
      alert('กรุณากรอกในรูปแบบ เช่น 10% หรือ -20');
    }
  };

  return (
    <div className={styles['master-container']}>
      {/* ✅ Cart Section */}
      <div className={`${styles.card} ${styles.cart}`}>
        <div className={styles.title}>🛒 รายการในตะกร้า</div>

        <div className={styles.products}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>━━━ 🛒 ไม่มีสินค้าในตะกร้า ━━━</div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem 0.75rem',
                  borderBottom: idx < cart.length - 1 ? '1px solid #e0e0e0' : 'none',
                }}>
                <div className={styles.details}>
                  <div className={styles.name}>{item.name}</div>
                  <ul style={{ margin: 0, paddingLeft: '0.25rem', fontSize: '0.85rem', color: '#000' }}>
                    <CartItemDetailsList item={item} />
                  </ul>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '0.7rem',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      marginLeft: 28,
                    }}>
                    <ButtonEdit onClick={() => onEditItem?.(item)} />
                    <ButtonDelete onClick={() => onDeleteItem?.(item.key)} />
                  </div>
                </div>

                <div className={styles.quantity}>
                  <div>x{item.qty}</div>
                  <span className={styles.price}>฿{(Number(item.unitPrice) * Number(item.qty || 0)).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Payment Section */}
      <div className={`${styles.card} ${styles.payment}`}>
        <div className={styles.title}>💳 วิธีการชำระเงิน</div>

        <div className="flex flex-col gap-3 mt-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              id="cash"
              name="payment"
              value="cash"
              checked={payment === 'cash'}
              onChange={() => {
                setPayment('cash');
                onPaymentChange?.('cash');
              }}
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="cash" className="flex items-center gap-2 cursor-pointer text-black">
              <span className="text-xl">💵</span>
              <span className="font-medium">เงินสด</span>
            </label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              id="promptpay"
              name="payment"
              value="promptpay"
              checked={payment === 'promptpay'}
              onChange={() => {
                setPayment('promptpay');
                onPaymentChange?.('promptpay');
              }}
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="promptpay" className="flex items-center gap-2 cursor-pointer text-black">
              <span className="text-xl">📱</span>
              <span className="font-medium">PromptPay</span>
            </label>
          </div>
        </div>
      </div>

      {/* ✅ Tax Invoice Section */}
      <div className={`${styles.card} ${styles.payment}`}>
        <div className={styles.title}>🧾 ใบกำกับภาษี</div>

        <div className="flex flex-col gap-3 mt-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              id="taxYes"
              name="taxInvoice"
              value="yes"
              checked={taxInvoice === 'yes'}
              onChange={() => {
                setTaxInvoice('yes');
                onTaxInvoiceChange?.('yes'); // ✅ ส่งขึ้นไป SellPage
              }}
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="taxYes" className="flex items-center gap-2 cursor-pointer text-black">
              <span className="text-xl">✅</span>
              <span className="font-medium">ออกใบกำกับภาษี</span>
            </label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              id="taxNo"
              name="taxInvoice"
              value="no"
              checked={taxInvoice === 'no'}
              onChange={() => {
                setTaxInvoice('no');
                onTaxInvoiceChange?.('no'); // ✅ ส่งขึ้นไป SellPage ด้วย
              }}
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="taxNo" className="flex items-center gap-2 cursor-pointer text-black">
              <span className="text-xl">🚫</span>
              <span className="font-medium">ไม่ออกใบกำกับภาษี</span>
            </label>
          </div>
        </div>
      </div>

      {/* ✅ Coupon Section */}
      <div className={`${styles.card} ${styles.coupons}`}>
        <div className={styles.title}>💸 โค้ดส่วนลด</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleApplyDiscount();
          }}>
          <input type="text" placeholder="เช่น 10% หรือ -20" value={discountInput} onChange={e => setDiscountInput(e.target.value)} className={styles.input_field} style={{ color: '#000' }} />
          <button type="submit" className={styles['checkout-btn']}>
            ยืนยัน
          </button>
        </form>
        {discountType === 'percent' && <p style={{ fontSize: '0.85rem', color: '#2e7d32', marginTop: '4px' }}>ใช้ส่วนลด {discountValue}%</p>}
        {discountType === 'fixed' && <p style={{ fontSize: '0.85rem', color: '#2e7d32', marginTop: '4px' }}>ใช้ส่วนลด {discountValue.toFixed(2)} บาท</p>}
      </div>

      {/* ✅ Checkout Section */}
      <div className={`${styles.card} ${styles.checkout}`}>
        <div className={styles.title}>✅ ชำระเงิน</div>

        <div className={styles.details}>
          <span>ยอดรวม:</span>
          <span>฿{total.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className={styles.details}>
            <span>ส่วนลด :</span>
            <span>-฿{discount.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.details}>
          <span>ค่าส่ง :</span>
          <span>฿0.00</span>
        </div>

        {taxInvoice === 'yes' && (
          <div className={styles.details}>
            <span>VAT 7% :</span>
            <span>฿{vatAmount.toFixed(2)}</span>
          </div>
        )}

        <div className={styles['checkout--footer']} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
          <label className={styles.price}>
            <span className="currency">฿</span>
            {totalDeposit.toFixed(2)}
          </label>

          {totalRemaining > 0 && <p style={{ textAlign: 'center', margin: 0, color: '#d32f2f', fontWeight: 600 }}>ค้างชำระ {totalRemaining.toFixed(2)} บาท</p>}

          <button className={styles['checkout-btn']} onClick={() => onCheckout(payment)} disabled={cart.length === 0} style={{ width: '100%' }}>
            ชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutRight;
