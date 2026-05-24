'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppShell from '@/app/home/shell';
import { ADMIN_AUTH_STORAGE_KEY, resolveAdminGuardRedirect } from '@/lib/admin-auth';

type AdminGuardLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function AdminGuardLayout({ children }: AdminGuardLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    const redirectPath = resolveAdminGuardRedirect(token);

    if (!redirectPath) {
      setIsChecking(false);
      return;
    }

    router.push(redirectPath);
  }, [router]);

  if (isChecking) return null;

  return <AppShell>{children}</AppShell>;
}
