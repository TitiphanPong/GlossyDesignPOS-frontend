import type { Metadata } from 'next';
import './globals.css';
import AppThemeProvider from './AppThemeProvider';
import { documentThai, prompt } from './home/fonts';

export const metadata: Metadata = {
  title: 'Glossy Design | Premium Printing & Branding',
  description: 'Glossy Design คือสตูดิโองานพิมพ์และงานแบรนด์ระดับพรีเมียมสำหรับนามบัตร แพ็กเกจ ป้าย และสื่อสิ่งพิมพ์ทุกประเภท',
  icons: {
    icon: '/logo/logo_website.png',
    shortcut: '/logo/logo_website.png',
    apple: '/logo/logo_website.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${documentThai.variable} ${prompt.className} antialiased`}>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
