'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import AppShell from '@/app/home/shell';
import { ADMIN_AUTH_STORAGE_KEY, clearAdminAuthSession, resolveAdminGuardRedirect, shouldClearStoredAdminToken } from '@/lib/admin-auth';

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

    if (shouldClearStoredAdminToken(token)) {
      clearAdminAuthSession(localStorage);
    }

    router.replace(redirectPath);
  }, [router]);

  if (isChecking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return <AppShell>{children}</AppShell>;
}
