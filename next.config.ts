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
      {
        source: '/home',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/home/saleListPage',
        destination: '/orders',
        permanent: false,
      },
      {
        source: '/home/posseller',
        destination: '/pos',
        permanent: false,
      },
      {
        source: '/home/storage',
        destination: '/storage',
        permanent: false,
      },
      {
        source: '/home/invoice/:orderId',
        destination: '/invoice/:orderId',
        permanent: false,
      },
    ];
  },
  // config อื่น ๆ ของคุณใส่ตรงนี้ได้
};

export default nextConfig;
