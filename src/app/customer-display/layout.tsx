import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Customer Display | Glossy Design',
  description: 'หน้าจอแสดงรายการสั่งซื้อ ยอดชำระ และ QR สำหรับลูกค้าหน้าร้าน',
};

export default function CustomerDisplayLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div>{children}</div>;
}
