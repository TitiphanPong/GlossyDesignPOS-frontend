'use client';

import { Suspense } from 'react';
import AppShell from '@/app/home/shell';

type AdminGuardLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function AdminGuardLayout({ children }: AdminGuardLayoutProps) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
