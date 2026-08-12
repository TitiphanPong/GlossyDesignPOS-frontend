import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep development artifacts separate so `next dev` does not corrupt
  // production build output when both workflows run on the same machine.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [
      { source: '/dashboard', destination: '/home', permanent: false },
      { source: '/orders', destination: '/home/orders', permanent: false },
      { source: '/pos', destination: '/home/posseller', permanent: false },
      { source: '/storage', destination: '/home/storage', permanent: false },
      { source: '/invoice/:orderId', destination: '/print/invoice/:orderId', permanent: false },
    ];
  },
};

export default nextConfig;
