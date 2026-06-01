'use client';

import AppShell from '@/app/home/shell';

type AdminGuardLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function AdminGuardLayout({ children }: AdminGuardLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
