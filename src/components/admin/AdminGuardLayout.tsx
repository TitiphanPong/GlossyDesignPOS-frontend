'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppShell from '@/app/home/shell';

type AdminGuardLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function AdminGuardLayout({ children }: AdminGuardLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token === 'glossy-secret') {
      setIsChecking(false);
      return;
    }

    router.push('/login');
  }, [router]);

  if (isChecking) return null;

  return <AppShell>{children}</AppShell>;
}
