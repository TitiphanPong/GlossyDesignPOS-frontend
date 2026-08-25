'use client';

import * as React from 'react';
import { Drawer, Stack } from '@mui/material';
import { drawerClasses } from '@mui/material/Drawer';
import { useRouter } from 'next/navigation';
import { destroyAdminBrowserSession } from '@/lib/admin-auth';
import SidebarFooter from './SidebarFooter';
import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';
import SidebarPrimaryAction from './SidebarPrimaryAction';
import { SIDEBAR_MENU_GROUPS, SIDEBAR_PRIMARY_ACTION } from './sidebarConfig';
import { filterSidebarGroups } from './sidebarNavigation';
import { sidebarDimensions, sidebarMotion, sidebarTokens } from './sidebarTheme';
import type { AdminRole, SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

export type AppSidebarProps = {
  id?: string;
  width?: number;
  collapsedWidth?: number;
  currentPath?: string;
  groups?: SidebarMenuGroup[];
  primaryAction?: SidebarNavItem;
  variant?: 'permanent' | 'temporary';
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  role?: AdminRole;
  username?: string;
};

export default function AppSidebar({
  id,
  width = sidebarDimensions.expanded,
  collapsedWidth = sidebarDimensions.collapsed,
  currentPath = '/',
  groups = SIDEBAR_MENU_GROUPS,
  primaryAction = SIDEBAR_PRIMARY_ACTION,
  variant = 'permanent',
  open = true,
  onClose,
  collapsed = false,
  onToggleCollapsed,
  role,
  username,
}: Readonly<AppSidebarProps>) {
  const router = useRouter();
  const mobile = variant === 'temporary';
  const showCollapsedState = !mobile && collapsed;
  const desktopWidth = showCollapsedState ? collapsedWidth : width;
  const visibleGroups = React.useMemo(() => filterSidebarGroups(groups, role), [groups, role]);

  const handleNavigate = React.useCallback(() => {
    if (mobile) onClose?.();
  }, [mobile, onClose]);

  const handleLogout = React.useCallback(() => {
    void (async () => {
      try {
        await destroyAdminBrowserSession();
      } catch {
        // Local session data is cleared by destroyAdminBrowserSession even when the request fails.
      } finally {
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        ...(mobile
          ? {}
          : {
              width: desktopWidth,
              flexShrink: 0,
              transition: `width ${sidebarMotion.drawer}`,
            }),
        [`& .${drawerClasses.paper}`]: {
          width: mobile ? { xs: `min(calc(100vw - 24px), ${sidebarDimensions.mobile}px)`, sm: sidebarDimensions.mobile } : desktopWidth,
          maxWidth: '100vw',
          height: '100dvh',
          boxSizing: 'border-box',
          overflow: 'hidden',
          border: 0,
          borderRight: `1px solid ${sidebarTokens.border}`,
          borderRadius: mobile ? '0 16px 16px 0' : 0,
          color: sidebarTokens.text,
          bgcolor: sidebarTokens.background,
          backgroundImage: 'none',
          boxShadow: mobile ? sidebarTokens.floatingShadow : sidebarTokens.shadow,
          fontFamily: 'var(--font-sans), Prompt, "Noto Sans Thai", sans-serif',
          transition: `width ${sidebarMotion.drawer}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transitionDuration: '0.01ms',
          [`& .${drawerClasses.paper}`]: { transitionDuration: '0.01ms' },
        },
      }}>
      <Stack id={id} sx={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
        <SidebarHeader collapsed={showCollapsedState} mobile={mobile} onToggleCollapsed={mobile ? undefined : onToggleCollapsed} onClose={onClose} onNavigate={handleNavigate} />
        <SidebarPrimaryAction item={primaryAction} currentPath={currentPath} collapsed={showCollapsedState} onNavigate={handleNavigate} />
        <SidebarMenu groups={visibleGroups} currentPath={currentPath} collapsed={showCollapsedState} onNavigate={handleNavigate} />
        <SidebarFooter username={username} role={role} collapsed={showCollapsedState} mobile={mobile} onLogout={handleLogout} />
      </Stack>
    </Drawer>
  );
}
