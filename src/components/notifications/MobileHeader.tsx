'use client';

import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Badge, Tooltip, Box, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { NotificationDrawer } from './NotificationDrawer';
import { useNotifications } from '@/lib/useNotifications';
import GlossyBrandMark from '@/components/navigation/GlossyBrandMark';
import { sidebarTokens } from '@/components/navigation/sidebarTheme';

type MobileHeaderProps = {
  onMenuOpen: () => void;
  menuOpen: boolean;
  menuId: string;
};

export function MobileHeader({ onMenuOpen, menuOpen, menuId }: Readonly<MobileHeaderProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    notifications,
    summary,
    count,
    isLoading,
    acknowledgeNotifications,
    snoozeNotifications,
    unacknowledgeNotifications,
  } = useNotifications();

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          color: sidebarTokens.text,
          backgroundColor: sidebarTokens.backgroundElevated,
          backgroundImage: 'none',
          borderBottom: `1px solid ${sidebarTokens.border}`,
          boxShadow: '0 5px 18px rgba(37, 34, 28, 0.055)',
          zIndex: theme => theme.zIndex.appBar,
        }}>
        <Toolbar
          sx={{
            display: 'grid',
            gridTemplateColumns: '44px minmax(0, 1fr) 44px',
            alignItems: 'center',
            px: 1.25,
            minHeight: '60px !important',
            gap: 0.75,
          }}>
          <IconButton
            onClick={onMenuOpen}
            aria-label="เปิดเมนูหลัก"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            sx={{
              width: 44,
              height: 44,
              border: `1px solid ${sidebarTokens.border}`,
              borderRadius: '12px',
              color: sidebarTokens.textSoft,
              bgcolor: sidebarTokens.backgroundElevated,
              '&:hover': { bgcolor: sidebarTokens.hoverBackground },
              '&:focus-visible': { outline: `2px solid ${sidebarTokens.focusRing}`, outlineOffset: 2 },
            }}>
            <MenuRoundedIcon aria-hidden="true" sx={{ fontSize: 22 }} />
          </IconButton>

          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.85,
            }}>
            <GlossyBrandMark size={34} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ color: sidebarTokens.text, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                GlossyDesign
              </Typography>
              <Box
                aria-hidden="true"
                sx={{
                  width: 38,
                  height: 2,
                  mt: 0.55,
                  background: `linear-gradient(90deg, ${sidebarTokens.cyan} 0 25%, ${sidebarTokens.magenta} 25% 50%, ${sidebarTokens.yellow} 50% 75%, ${sidebarTokens.registrationBlack} 75%)`,
                }}
              />
            </Box>
          </Box>

          <Tooltip title="งานที่ต้องจัดการ" enterDelay={250}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="เปิดการแจ้งเตือนงานที่ต้องจัดการ"
              sx={{
                width: 44,
                height: 44,
                border: `1px solid ${sidebarTokens.border}`,
                borderRadius: '12px',
                color: sidebarTokens.textSoft,
                bgcolor: sidebarTokens.backgroundElevated,
                '&:hover': { bgcolor: sidebarTokens.hoverBackground },
                '&:focus-visible': { outline: `2px solid ${sidebarTokens.focusRing}`, outlineOffset: 2 },
              }}>
              <Badge
                badgeContent={count?.actionRequired ?? 0}
                color="error"
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 10,
                    border: `2px solid ${sidebarTokens.backgroundElevated}`,
                    padding: '0 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                  },
                }}>
                <NotificationsRoundedIcon aria-hidden="true" sx={{ fontSize: 21 }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        summary={summary}
        isLoading={isLoading}
        onAcknowledge={acknowledgeNotifications}
        onSnooze={snoozeNotifications}
        onUnacknowledge={unacknowledgeNotifications}
      />
    </>
  );
}
