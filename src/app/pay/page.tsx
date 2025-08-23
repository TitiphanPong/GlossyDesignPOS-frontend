'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function PayPage({ searchParams }: any) {
  const ref = searchParams.ref as string;
  const amount = Number(searchParams.amount || 0);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/payments/promptpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, amount }),
      });
      const data = await res.json();
      setQr(data.dataURL);
    })();
  }, [ref, amount]);

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">สแกนจ่ายด้วยพร้อมเพย์</h1>
        <p>จำนวนเงิน: {amount.toFixed(2)} THB</p>
        {qr ? <img src={qr} alt="PromptPay QR" className="w-64 h-64 mx-auto"/> : <div>กำลังสร้าง QR...</div>}
        <p className="text-sm text-gray-500">* ตัวอย่างง่ายๆ ยังไม่ได้ผูก webhook/ยืนยันอัตโนมัติ</p>
      </div>
    </div>
  );
}