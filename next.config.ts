import type { NextConfig } from 'next';

const isolatedDistDir = process.env.NEXT_DIST_DIR?.trim();

const nextConfig: NextConfig = {
  // Keep normal development, Playwright, and production artifacts independent.
  // Playwright sets NEXT_DIST_DIR=.next-e2e so its Next lock cannot collide with
  // a developer-owned `next dev` process using .next-dev.
  distDir: process.env.NODE_ENV === 'development' ? isolatedDistDir || '.next-dev' : '.next',
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
