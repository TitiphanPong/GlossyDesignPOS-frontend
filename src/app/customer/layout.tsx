import type { ReactNode } from 'react';
import { Noto_Sans_Thai } from 'next/font/google';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export default function CustomerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={notoSansThai.className}>{children}</div>;
}
