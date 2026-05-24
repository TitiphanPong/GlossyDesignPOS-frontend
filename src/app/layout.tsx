import type { Metadata } from 'next';
import './globals.css';
import { kanit, prompt } from './home/fonts';

export const metadata: Metadata = {
  title: 'Glossy Design | Premium Printing & Branding',
  description: 'Glossy Design คือสตูดิโองานพิมพ์และงานแบรนด์ระดับพรีเมียมสำหรับนามบัตร แพ็กเกจ ป้าย และสื่อสิ่งพิมพ์ทุกประเภท',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${kanit.variable} ${prompt.className} antialiased`}>{children}</body>
    </html>
  );
}
