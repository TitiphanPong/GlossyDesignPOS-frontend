'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PosPage() {
  const [pages, setPages] = useState(1);
  const [qty, setQty] = useState(1);
  const [grayscale, setGrayscale] = useState(false);
  const router = useRouter();

  const [subtotal, setSubtotal] = useState<number | null>(null);

  const calc = async () => {
    const data = await api<{ unit: number; subtotal: number; currency: string }>(
      '/pricing/evaluate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, duplex: false, grayscale, qty }),
      },
    );
    setSubtotal(data.subtotal);
  };

  const goPay = async () => {
    const amount = subtotal || 0;
    const orderId = 'ORD-' + Date.now();
    router.push(`/pay?ref=${orderId}&amount=${amount}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">POS — ตัวอย่างคำนวณราคา</h1>
      <label className="block">จำนวนหน้า: <input type="number" min={1} value={pages} onChange={e=>setPages(+e.target.value)} className="border px-2 py-1 ml-2 w-24"/></label>
      <label className="block">จำนวนชุด: <input type="number" min={1} value={qty} onChange={e=>setQty(+e.target.value)} className="border px-2 py-1 ml-2 w-24"/></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={grayscale} onChange={e=>setGrayscale(e.target.checked)}/> ขาวดำ</label>

      <div className="flex gap-3">
        <button onClick={calc} className="px-4 py-2 rounded bg-black text-white">คำนวณ</button>
        {subtotal !== null && <div className="px-3 py-2 border rounded">ยอดชำระ: {subtotal.toFixed(2)} THB</div>}
      </div>

      <button disabled={!subtotal} onClick={goPay} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">ไปหน้าชำระเงิน</button>
    </div>
  );
}