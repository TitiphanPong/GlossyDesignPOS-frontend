'use client';

import React, { useEffect, useState } from 'react';
import styles from './checkoutRight.module.css';

type CartItem = {
  key: string;
  name: string;
  variant: string;
  qty: number;
  unitPrice: number;
  note?: string;
  customerName?: string;
  companyName?: string;
  material?: string;
  sides?: string;
};

type Props = {
  cart: CartItem[];
  total: number;
  discount: number;
  onCheckout: (payment: 'cash' | 'promptpay') => void;
  onDiscountChange?: (discount: number) => void;
  onPaymentChange?: (payment: 'cash' | 'promptpay') => void;
};

const CheckOutRight: React.FC<Props> = ({
  cart,
  total,
  discount,
  onCheckout,
  onDiscountChange,
  onPaymentChange,
}) => {
  const [discountInput, setDiscountInput] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | null>(null);
  const [payment, setPayment] = useState<'cash' | 'promptpay'>('cash');

  useEffect(() => {
    if (discount === 0) {
      setDiscountInput('');
      setDiscountValue(0);
      setDiscountType(null);
    }
  }, [discount]);

  // ✅ คำนวณราคาสุทธิ
  const finalTotal =
    discountType === 'percent'
      ? total - (total * discountValue) / 100
      : discountType === 'fixed'
        ? Math.max(total - discountValue, 0) // ป้องกันติดลบ
        : total;

  const handleApplyDiscount = () => {
    const value = discountInput.trim();

    if (!value) {
      setDiscountValue(0);
      setDiscountType(null);
      onDiscountChange?.(0);
      return;
    }

    // ✅ case ส่วนลด %
    if (value.endsWith('%')) {
      const percent = parseFloat(value.replace('%', ''));
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        setDiscountValue(percent);
        setDiscountType('percent');
        onDiscountChange?.((total * percent) / 100);
      } else {
        alert('กรุณากรอกเปอร์เซ็นต์ 0-100%');
      }
    }
    // ✅ case ส่วนลดคงที่ เช่น -20
    else if (value.startsWith('-')) {
      const fixed = parseFloat(value.replace('-', ''));
      if (!isNaN(fixed) && fixed > 0) {
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
      {/* Cart */}
      <div className={`${styles.card} ${styles.cart}`}>
        <div className={styles.title}>🛒 รายการในตะกร้า</div>
        <div className={styles.products}>
          {cart.map(item => (
            <div
              key={item.key}
              className={styles.product}
              style={{ alignItems: 'flex-start', paddingLeft: '0.25rem' }}>
              <div className={styles.details}>
                <div className={styles.name}>{item.name}</div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '0.25rem',
                    fontSize: '0.85rem',
                    color: '#000',
                  }}>
                  <li>👤 ลูกค้า: {item.customerName || 'ไม่ระบุ'}</li>
                  <li>🏢 บริษัท: {item.companyName || 'ไม่ระบุ'}</li>
                  <li>📑 การพิมพ์: {item.sides ? `พิมพ์ ${item.sides} ด้าน` : 'ไม่ระบุ'}</li>
                  <li>📄 กระดาษ: {item.material || 'ไม่ระบุ'}</li>
                  <li>📝 หมายเหตุ: {item.note || 'ไม่ระบุ'}</li>
                </ul>
              </div>
              <div className={styles.quantity}>
                <div>x{item.qty}</div>
                <span className={styles.price}>฿{(item.unitPrice * item.qty).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon */}
      <div className={`${styles.card} ${styles.coupons}`}>
        <div className={styles.title}>💸 โค้ดส่วนลด</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleApplyDiscount();
          }}>
          <input
            type="text"
            placeholder="เช่น 10% หรือ -20"
            value={discountInput}
            onChange={e => setDiscountInput(e.target.value)}
            className={styles.input_field}
            style={{ color: '#000' }}
          />
          <button type="submit" className={styles['checkout-btn']}>
            ยืนยัน
          </button>
        </form>
        {discountType === 'percent' && (
          <p style={{ fontSize: '0.85rem', color: '#2e7d32', marginTop: '4px' }}>
            ใช้ส่วนลด {discountValue}%
          </p>
        )}
        {discountType === 'fixed' && (
          <p style={{ fontSize: '0.85rem', color: '#2e7d32', marginTop: '4px' }}>
            ใช้ส่วนลด {discountValue.toFixed(2)} บาท
          </p>
        )}
      </div>

      {/* Payment Method */}
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
            <label
              htmlFor="promptpay"
              className="flex items-center gap-2 cursor-pointer text-black">
              <span className="text-xl">📱</span>
              <span className="font-medium">PromptPay</span>
            </label>
          </div>
        </div>
      </div>

      {/* Checkout */}
      <div className={`${styles.card} ${styles.checkout}`}>
        <div className={styles.title}>✅ ชำระเงิน</div>
        <div className={styles.details}>
          <span>ยอดรวม:</span>
          <span>฿{total.toFixed(2)}</span>
        </div>
        {discountType && (
          <div className={styles.details}>
            <span>ส่วนลด:</span>
            <span>
              -฿
              {discountType === 'percent'
                ? ((total * discountValue) / 100).toFixed(2)
                : discountValue.toFixed(2)}
            </span>
          </div>
        )}
        <div className={styles.details}>
          <span>ค่าส่ง:</span>
          <span>฿0.00</span>
        </div>
        <div className={styles['checkout--footer']}>
          <label className={styles.price}>
            <span className="currency">฿</span>
            {finalTotal.toFixed(2)}
          </label>
          <button
            className={styles['checkout-btn']}
            onClick={() => onCheckout(payment)}
            disabled={cart.length === 0}>
            ชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutRight;
