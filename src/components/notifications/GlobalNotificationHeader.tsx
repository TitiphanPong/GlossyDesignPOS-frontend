'use client';

import { Box, Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { useNotifications } from '@/lib/useNotifications';
import { sidebarTokens } from '@/components/navigation/sidebarTheme';

export function GlobalNotificationHeader() {
  const { summary, openDrawer } = useNotifications();

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
            onClick={openDrawer}
            aria-label="เปิดการแจ้งเตือนงานที่ต้องจัดการ"
            aria-description={`รายการใหม่ ${summary.attention} รายการ`}
            data-action-center-trigger
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
              badgeContent={summary.attention}
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


    </>
  );
}
