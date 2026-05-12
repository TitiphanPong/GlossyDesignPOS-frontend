// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ ตรงนี้ถึงจะทำงาน
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing',
        permanent: false,
      },
    ];
  },
  // config อื่น ๆ ของคุณใส่ตรงนี้ได้
};

export default nextConfig;
