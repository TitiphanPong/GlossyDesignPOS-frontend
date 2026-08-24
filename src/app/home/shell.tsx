'use client';

import * as React from 'react';
import { Box, Button, CircularProgress, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import SideMenu from './components/SideMenu';
import PageTransition from '@/components/transitions/PageTransition';
import { destroyAdminBrowserSession } from '@/lib/admin-auth';
import { GlobalNotificationHeader } from '@/components/notifications/GlobalNotificationHeader';
import { MobileHeader } from '@/components/notifications/MobileHeader';

const DESKTOP_DRAWER_WIDTH = 286;
const DESKTOP_COLLAPSED_WIDTH = 92;

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);
  const [sessionState, setSessionState] = React.useState<'checking' | 'authenticated' | 'unavailable'>('checking');
  const [role, setRole] = React.useState<'staff' | 'manager' | 'admin' | null>(null);
  const [sessionCheck, setSessionCheck] = React.useState(0);

  const redirectToLogin = React.useCallback(() => {
    const target = `${globalThis.location.pathname}${globalThis.location.search}`;
    globalThis.location.replace(`/login?redirectTo=${encodeURIComponent(target)}`);
  }, []);

  const handleReturnToLogin = React.useCallback(() => {
    void (async () => {
      await destroyAdminBrowserSession();
      globalThis.location.replace('/login');
    })();
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const verifySession = async () => {
      setSessionState('checking');
      try {
        const response = await fetch('/api/admin/session', {
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          setSessionState('unavailable');
          return;
        }
        const payload = (await response.json()) as { authenticated?: boolean; role?: 'staff' | 'manager' | 'admin' };
        if (!payload.authenticated || !payload.role) {
          redirectToLogin();
          return;
        }
        if (
          (globalThis.location.pathname.startsWith('/home/staff') && payload.role !== 'admin') ||
          (globalThis.location.pathname.startsWith('/home/settings/quick-menu') && payload.role === 'staff')
        ) {
          globalThis.location.replace('/home');
          return;
        }
        setRole(payload.role);
        setSessionState('authenticated');
      } catch {
        if (!controller.signal.aborted) setSessionState('unavailable');
      }
    };

    void verifySession();
    return () => controller.abort();
  }, [redirectToLogin, sessionCheck]);

  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          redirectToLogin();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [redirectToLogin]);

  React.useEffect(() => {
    const saved = globalThis.localStorage.getItem('glossy-admin-sidemenu-collapsed');
    setDesktopCollapsed(saved === 'true');
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, pathname]);

  const handleToggleDesktopMenu = React.useCallback(() => {
    setDesktopCollapsed(prev => {
      const next = !prev;
      globalThis.localStorage.setItem('glossy-admin-sidemenu-collapsed', String(next));
      return next;
    });
  }, []);

  if (sessionState !== 'authenticated') {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Stack alignItems="center" spacing={1.5}>
          {sessionState === 'checking' ? <CircularProgress size={34} /> : null}
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {sessionState === 'checking' ? 'กำลังตรวจสอบสิทธิ์การเข้าใช้งาน…' : 'ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองรีเฟรชอีกครั้ง'}
          </Typography>
          {sessionState === 'unavailable' ? (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => setSessionCheck(value => value + 1)}>
                ลองใหม่
              </Button>
              <Button variant="outlined" onClick={handleReturnToLogin}>
                ออกจากระบบ
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}>
      {isMobile ? (
        <SideMenu role={role ?? undefined} variant="temporary" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentPath={pathname ?? '/'} />
      ) : (
        <SideMenu
          role={role ?? undefined}
          width={DESKTOP_DRAWER_WIDTH}
          collapsedWidth={DESKTOP_COLLAPSED_WIDTH}
          currentPath={pathname ?? '/'}
          collapsed={desktopCollapsed}
          onToggleCollapsed={handleToggleDesktopMenu}
        />
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
        }}>
        <GlobalNotificationHeader />

        <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

        <PageTransition routeKey={pathname ?? '/'}>{children}</PageTransition>
      </Box>
    </Box>
  );
}
