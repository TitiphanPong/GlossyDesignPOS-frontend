'use client';

import React, { useState } from 'react';
import { Box, Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { useNotifications } from '@/lib/useNotifications';

export function GlobalNotificationHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, count, isLoading, resolveNotification, dismissNotification } = useNotifications();

  return (
    <>
      <Tooltip title="งานที่ต้องจัดการ">
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
            sx={{
              borderRadius: 2,
              border: '1px solid #DFE8F5',
              bgcolor: '#FFFFFF',
              width: 44,
              height: 44,
              boxShadow: '0 10px 20px rgba(12, 56, 110, 0.08)',
              '&:hover': {
                bgcolor: '#F7FAFF',
              },
            }}>
            <Badge
              badgeContent={count?.actionRequired ?? 0}
              color="error"
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 13,
                  border: '2px solid white',
                  padding: '0 4px',
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                },
              }}>
              <NotificationsRoundedIcon sx={{ color: '#2A4365' }} />
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
