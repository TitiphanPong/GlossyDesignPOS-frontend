'use client';

import * as React from 'react';
import { Box, CircularProgress, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import SideMenu from './components/SideMenu';
import PageTransition from '@/components/transitions/PageTransition';

const DESKTOP_DRAWER_WIDTH = 286;
const DESKTOP_COLLAPSED_WIDTH = 92;

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);
  const [sessionState, setSessionState] = React.useState<'checking' | 'authenticated' | 'unavailable'>('checking');

  const redirectToLogin = React.useCallback(() => {
    const target = `${globalThis.location.pathname}${globalThis.location.search}`;
    globalThis.location.replace(`/login?redirectTo=${encodeURIComponent(target)}`);
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
        const payload = (await response.json()) as { authenticated?: boolean };
        if (!payload.authenticated) {
          redirectToLogin();
          return;
        }
        setSessionState('authenticated');
      } catch {
        if (!controller.signal.aborted) setSessionState('unavailable');
      }
    };

    void verifySession();
    return () => controller.abort();
  }, [redirectToLogin]);

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
        <Box sx={{ display: 'grid', justifyItems: 'center', gap: 1.5 }}>
          {sessionState === 'checking' ? <CircularProgress size={34} /> : null}
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {sessionState === 'checking' ? 'กำลังตรวจสอบสิทธิ์การเข้าใช้งาน…' : 'ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองรีเฟรชอีกครั้ง'}
          </Typography>
        </Box>
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
        <SideMenu variant="temporary" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentPath={pathname ?? '/'} />
      ) : (
        <SideMenu width={DESKTOP_DRAWER_WIDTH} collapsedWidth={DESKTOP_COLLAPSED_WIDTH} currentPath={pathname ?? '/'} collapsed={desktopCollapsed} onToggleCollapsed={handleToggleDesktopMenu} />
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
        }}>
        {isMobile && (
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              position: 'fixed',
              top: { xs: 12, md: 16 },
              left: { xs: 12, md: 16 },
              zIndex: 1100,
              border: '1px solid rgba(148, 163, 184, 0.22)',
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
              '&:hover': {
                bgcolor: '#FFFFFF',
              },
            }}>
            <MenuRoundedIcon />
          </IconButton>
        )}

        <PageTransition routeKey={pathname ?? '/'}>{children}</PageTransition>
      </Box>
    </Box>
  );
}
