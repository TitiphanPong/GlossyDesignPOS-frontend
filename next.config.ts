// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  i18n: {
    locales: ['th'],
    defaultLocale: 'th',
  },
    eslint: {
      ignoreDuringBuilds: true, // ✅ ตรงนี้ถึงจะทำงาน
    },
  // config อื่น ๆ ของคุณใส่ตรงนี้ได้
};

export default nextConfig;
