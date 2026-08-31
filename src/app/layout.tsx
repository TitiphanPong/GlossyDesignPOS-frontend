import type { Metadata } from 'next';
import './globals.css';
import { prompt } from './home/fonts';

export const metadata: Metadata = {
  title: 'Glossy Design | Premium Printing & Branding',
  description: 'Glossy Design คือสตูดิโองานพิมพ์และงานแบรนด์ระดับพรีเมียมสำหรับนามบัตร แพ็กเกจ ป้าย และสื่อสิ่งพิมพ์ทุกประเภท',
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${prompt.className} antialiased`}>{children}</body>
    </html>
  );
}
