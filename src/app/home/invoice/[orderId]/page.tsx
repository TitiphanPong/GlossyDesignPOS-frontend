'use client';
import { use } from 'react';
import { useEffect, useState } from 'react';

// ประกาศ type ของ order คร่าว ๆ
interface CartItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  cart: CartItem[];
  finalTotal: number;
  vatAmount: number;
  grandTotal: number;
}

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  // ✅ ใช้ React.use() unwrap params (เพราะ Next.js 15 ให้ params เป็น Promise)
  const { orderId } = use(params);

  console.log(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`);
        if (!res.ok) throw new Error('โหลดออเดอร์ไม่สำเร็จ');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('❌ Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;
  if (!order) return <p>ไม่พบข้อมูลออเดอร์</p>;

  return (
    <div>
      {/* ปุ่มควบคุม (จะไม่ถูกพิมพ์ออกมา) */}
      <div className="no-print" style={{ margin: '10px 0' }}>
        <button onClick={() => window.print()}>🖨️ Print / Save PDF</button>
      </div>

      {/* ใบกำกับภาษี A4 แบบซ้าย–ขวา */}
      <div id="invoice" className="invoice-page">
        {/* ซ้าย: ต้นฉบับ */}
        <div className="invoice-column">
          <h2>ใบกำกับภาษี (ต้นฉบับ)</h2>
          <p>
            <b>เลขที่:</b> {order.orderId}
          </p>
          <p>
            <b>ลูกค้า:</b> {order.customerName}
          </p>
          <p>
            <b>เบอร์โทร:</b> {order.phoneNumber}
          </p>

          <table>
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>ราคา/หน่วย</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.cart.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toFixed(2)}</td>
                  <td>{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>ยอดก่อน VAT: {order.finalTotal.toFixed(2)} บาท</p>
          <p>VAT 7%: {order.vatAmount.toFixed(2)} บาท</p>
          <h3>ยอดรวมสุทธิ: {order.grandTotal.toFixed(2)} บาท</h3>
        </div>

        {/* ขวา: สำเนา */}
        <div className="invoice-column">
          <h2>ใบกำกับภาษี (สำเนา)</h2>
          <p>
            <b>เลขที่:</b> {order.orderId}
          </p>
          <p>
            <b>ลูกค้า:</b> {order.customerName}
          </p>
          <p>
            <b>เบอร์โทร:</b> {order.phoneNumber}
          </p>
          {/* 👉 จะ render cart ซ้ำเหมือนต้นฉบับก็ได้ */}
          <table>
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>ราคา/หน่วย</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.cart.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toFixed(2)}</td>
                  <td>{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>ยอดก่อน VAT: {order.finalTotal.toFixed(2)} บาท</p>
          <p>VAT 7%: {order.vatAmount.toFixed(2)} บาท</p>
          <h3>ยอดรวมสุทธิ: {order.grandTotal.toFixed(2)} บาท</h3>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .invoice-page {
          display: flex;
          width: 210mm;
          height: 297mm;
          margin: auto;
          font-family: 'TH Sarabun New', sans-serif;
        }
        .invoice-column {
          width: 50%;
          padding: 10mm;
          border-right: 2px dashed black;
          box-sizing: border-box;
        }
        .invoice-column:last-child {
          border-right: none;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th,
        td {
          border: 1px solid #000;
          padding: 4px;
          text-align: left;
        }
        /* ✅ Print เฉพาะ invoice */
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice,
          #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
