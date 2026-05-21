'use client';

import * as React from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { usePathname } from 'next/navigation';
import SideMenu from './components/SideMenu';

const DESKTOP_DRAWER_WIDTH = 286;
const DESKTOP_COLLAPSED_WIDTH = 92;

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = window.localStorage.getItem('glossy-admin-sidemenu-collapsed');
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
      window.localStorage.setItem('glossy-admin-sidemenu-collapsed', String(next));
      return next;
    });
  }, []);

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
        <SideMenu
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

        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
}
