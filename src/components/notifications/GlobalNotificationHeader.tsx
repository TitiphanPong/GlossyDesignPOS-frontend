'use client';

import { useState } from 'react';
import { Box, Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { useNotifications } from '@/lib/useNotifications';
import { sidebarTokens } from '@/components/navigation/sidebarTheme';

export function GlobalNotificationHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, count, isLoading, resolveNotification, dismissNotification } = useNotifications();

  return (
    <>
      <Tooltip title="งานที่ต้องจัดการ" enterDelay={250}>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
          }}>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            aria-label="เปิดการแจ้งเตือนงานที่ต้องจัดการ"
            sx={{
              borderRadius: '12px',
              border: `1px solid ${sidebarTokens.border}`,
              bgcolor: sidebarTokens.backgroundElevated,
              width: 44,
              height: 44,
              color: sidebarTokens.textSoft,
              boxShadow: '0 7px 18px rgba(37, 34, 28, 0.08)',
              '&:hover': {
                bgcolor: sidebarTokens.hoverBackground,
              },
              '&:focus-visible': { outline: `2px solid ${sidebarTokens.focusRing}`, outlineOffset: 2 },
            }}>
            <Badge
              badgeContent={count?.actionRequired ?? 0}
              color="error"
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 13,
                  border: `2px solid ${sidebarTokens.backgroundElevated}`,
                  padding: '0 4px',
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                },
              }}>
              <NotificationsRoundedIcon aria-hidden="true" sx={{ color: sidebarTokens.textSoft }} />
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>

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
