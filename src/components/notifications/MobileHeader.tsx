'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Badge, Tooltip, Box, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { NotificationDrawer } from './NotificationDrawer';
import { useNotifications } from '@/lib/useNotifications';

type MobileHeaderProps = {
  onMenuOpen: () => void;
};

export function MobileHeader({ onMenuOpen }: Readonly<MobileHeaderProps>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, count, isLoading, resolveNotification, dismissNotification } = useNotifications();

  if (!isMobile) return null;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          zIndex: 999,
        }}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1.5,
            minHeight: 56,
            gap: 1,
          }}>
          {/* Hamburger - Left */}
          <IconButton
            onClick={onMenuOpen}
            sx={{
              color: '#2A4365',
              flexShrink: 0,
            }}>
            <MenuRoundedIcon />
          </IconButton>

          {/* Title/Logo - Center */}
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              minWidth: 0,
            }}>
            <Box
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: '#101828',
                letterSpacing: '-0.5px',
              }}>
              Glossy POS
            </Box>
          </Box>

          {/* Bell - Right */}
          <Tooltip title="งานที่ต้องจัดการ">
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                color: '#2A4365',
                flexShrink: 0,
              }}>
              <Badge
                badgeContent={count?.actionRequired ?? 0}
                color="error"
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 10,
                    border: '2px solid white',
                    padding: '0 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                  },
                }}>
                <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Spacer to account for fixed AppBar */}
      <Box sx={{ height: 56 }} />

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        isLoading={isLoading}
        notificationCount={count ?? undefined}
        onNotificationResolve={resolveNotification}
        onNotificationDismiss={dismissNotification}
      />
    </>
  );
}
