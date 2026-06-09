// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep development artifacts separate so `next dev` does not corrupt
  // production build output when both workflows run on the same machine.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  outputFileTracingRoot: process.cwd(),
  eslint: {
    ignoreDuringBuilds: true, // ✅ ตรงนี้ถึงจะทำงาน
  },
  async redirects() {
    return [
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
        destination: '/print/invoice/:orderId',
        permanent: false,
      },
    ];
  },
  // config อื่น ๆ ของคุณใส่ตรงนี้ได้
};

export default nextConfig;
