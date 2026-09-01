'use client';

import * as React from 'react';
import { Box, Button, CircularProgress, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { usePathname, useSearchParams } from 'next/navigation';
import axios from 'axios';
import AppSidebar from '@/components/navigation/AppSidebar';
import { sidebarDimensions } from '@/components/navigation/sidebarTheme';
import PageTransition from '@/components/transitions/PageTransition';
import { destroyAdminBrowserSession } from '@/lib/admin-auth';
import { GlobalNotificationHeader } from '@/components/notifications/GlobalNotificationHeader';
import { MobileHeader } from '@/components/notifications/MobileHeader';

const SIDEBAR_STORAGE_KEY = 'glossy-admin-sidemenu-collapsed';
const MOBILE_SIDEBAR_ID = 'app-mobile-sidebar';

type AdminSessionUser = {
  username?: string;
  role: 'staff' | 'manager' | 'admin';
};

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentNavigationPath = React.useMemo(() => {
    const currentPathname = pathname ?? '/';
    const query = searchParams.toString();
    return query ? `${currentPathname}?${query}` : currentPathname;
  }, [pathname, searchParams]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);
  const [collapsePreferenceReady, setCollapsePreferenceReady] = React.useState(false);
  const [sessionState, setSessionState] = React.useState<'checking' | 'authenticated' | 'unavailable'>('checking');
  const [sessionUser, setSessionUser] = React.useState<AdminSessionUser | null>(null);
  const [sessionCheck, setSessionCheck] = React.useState(0);

  const redirectToLogin = React.useCallback(() => {
    const target = `${globalThis.location.pathname}${globalThis.location.search}`;
    globalThis.location.replace(`/login?redirectTo=${encodeURIComponent(target)}`);
  }, []);

  const handleReturnToLogin = React.useCallback(() => {
    void (async () => {
      try {
        await destroyAdminBrowserSession();
      } catch {
        // Local session data is still cleared when the backend logout request is unavailable.
      } finally {
        globalThis.location.replace('/login');
      }
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
        const payload = (await response.json()) as { authenticated?: boolean; username?: string; role?: 'staff' | 'manager' | 'admin' };
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
        setSessionUser({
          username: typeof payload.username === 'string' ? payload.username.trim() || undefined : undefined,
          role: payload.role,
        });
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
    try {
      const saved = globalThis.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setDesktopCollapsed(saved === 'true');
    } catch {
      setDesktopCollapsed(false);
    } finally {
      setCollapsePreferenceReady(true);
    }
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [isMobile, pathname]);

  const handleToggleDesktopMenu = React.useCallback(() => {
    setDesktopCollapsed(prev => {
      const next = !prev;
      try {
        globalThis.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // The menu remains usable when browser storage is unavailable.
      }
      return next;
    });
  }, []);

  if (sessionState !== 'authenticated' || !collapsePreferenceReady) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Stack alignItems="center" spacing={1.5}>
          {sessionState === 'checking' || !collapsePreferenceReady ? <CircularProgress size={34} /> : null}
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {sessionState === 'checking' || !collapsePreferenceReady ? 'กำลังเตรียมพื้นที่ทำงาน…' : 'ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองรีเฟรชอีกครั้ง'}
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
        height: '100dvh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}>
      {isMobile ? (
        <AppSidebar
          id={MOBILE_SIDEBAR_ID}
          role={sessionUser?.role}
          username={sessionUser?.username}
          variant="temporary"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPath={currentNavigationPath}
        />
      ) : (
        <AppSidebar
          role={sessionUser?.role}
          username={sessionUser?.username}
          width={sidebarDimensions.expanded}
          collapsedWidth={sidebarDimensions.collapsed}
          currentPath={currentNavigationPath}
          collapsed={desktopCollapsed}
          onToggleCollapsed={handleToggleDesktopMenu}
        />
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: isMobile && mobileMenuOpen ? 'hidden' : 'auto',
          overflowX: 'hidden',
          bgcolor: 'background.default',
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          position: 'relative',
        }}>
        {isMobile ? <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} menuOpen={mobileMenuOpen} menuId={MOBILE_SIDEBAR_ID} /> : <GlobalNotificationHeader />}

        <PageTransition routeKey={pathname ?? '/'}>{children}</PageTransition>
      </Box>
    </Box>
  );
}
