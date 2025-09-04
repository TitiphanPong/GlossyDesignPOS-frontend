'use client';

import React from 'react';
import styled from 'styled-components';

type CartItem = {
  key: string;
  name: string;
  variant: string;
  qty: number;
  unitPrice: number;
  note?: string;
};

type Props = {
  cart: CartItem[];
  total: number;
  onCheckout: () => void;
};

const StyledWrapper = styled.div`
  .master-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 420px;
  }

  .card {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 1rem;
    background: white;
  }

  .title {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .products {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .product {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
  }

  .quantity {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .price {
    font-weight: bold;
  }

  .form {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .form input {
    flex: 1;
    padding: 0.5rem;
  }

  .checkout--footer {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .checkout-btn {
    background: #ff8413;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  }
`;

const CheckOutRight: React.FC<Props> = ({ cart, total, onCheckout }) => {
  return (
    <StyledWrapper>
      <div className="master-container">
        <div className="card cart">
          <label className="title">รายการในตะกร้า</label>
          <div className="products">
            {cart.map((item) => (
              <div key={item.key} className="product">
                <div>
                  <span>{item.name}</span>
                  <p>{item.variant}</p>
                  {item.note && <p>{item.note}</p>}
                </div>
                <div className="quantity">
                  <label>x{item.qty}</label>
                </div>
                <label className="price small">
                  ฿{(item.unitPrice * item.qty).toFixed(2)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card coupons">
          <label className="title">โค้ดส่วนลด</label>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="ระบุโค้ดที่นี่..." className="input_field" />
            <button>Apply</button>
          </form>
        </div>

        <div className="card checkout">
          <label className="title">ชำระเงิน</label>
          <div className="details">
            <span>ยอดรวม:</span>
            <span>฿{total.toFixed(2)}</span>
            <span>ค่าส่ง:</span>
            <span>฿0.00</span>
          </div>
          <div className="checkout--footer">
            <label className="price">
              <sup>฿</sup>{total.toFixed(2)}
            </label>
            <button className="checkout-btn" onClick={onCheckout}>ยืนยัน</button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default CheckOutRight;
