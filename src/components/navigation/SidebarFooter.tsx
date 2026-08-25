'use client';

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { sidebarMotion, sidebarTokens } from './sidebarTheme';
import type { AdminRole } from './sidebarTypes';

const ROLE_LABELS: Record<AdminRole, string> = {
  staff: 'พนักงาน',
  manager: 'ผู้จัดการ',
  admin: 'ผู้ดูแลระบบ',
};

type SidebarFooterProps = {
  username?: string;
  role?: AdminRole;
  collapsed: boolean;
  mobile: boolean;
  onLogout: () => void;
};

export default function SidebarFooter({ username, role, collapsed, mobile, onLogout }: Readonly<SidebarFooterProps>) {
  const normalizedUsername = username?.trim();
  const roleLabel = role ? ROLE_LABELS[role] : undefined;
  const profileLabel = [normalizedUsername, roleLabel].filter(Boolean).join(' · ');
  const initial = normalizedUsername?.charAt(0).toUpperCase();

  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        px: 1.5,
        pt: 1.35,
        pb: mobile ? 'calc(10.8px + env(safe-area-inset-bottom))' : 1.35,
        borderTop: `1px solid ${sidebarTokens.border}`,
      }}>
      <Stack direction="column" alignItems="flex-start" spacing={0.8}>
        <Tooltip title={collapsed ? profileLabel : ''} placement="right" enterDelay={250}>
          <Stack
            role="group"
            aria-label={profileLabel || undefined}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              minWidth: 0,
              width: '100%',
              pl: 0.6,
              justifyContent: 'flex-start',
              borderRadius: '11px',
            }}>
            <Avatar
              aria-hidden="true"
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                border: `1px solid ${sidebarTokens.borderStrong}`,
                color: sidebarTokens.textSoft,
                bgcolor: sidebarTokens.paperDeep,
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 700,
              }}>
              {initial || <PersonOutlineRoundedIcon aria-hidden="true" sx={{ fontSize: 20 }} />}
            </Avatar>
            {!collapsed ? (
              <Box sx={{ minWidth: 0, flex: 1 }}>
                {normalizedUsername ? (
                  <Typography noWrap sx={{ color: sidebarTokens.text, fontFamily: 'inherit', fontSize: 13.25, fontWeight: 700, lineHeight: 1.25 }}>
                    {normalizedUsername}
                  </Typography>
                ) : null}
                {roleLabel ? (
                  <Typography noWrap sx={{ mt: normalizedUsername ? 0.3 : 0, color: sidebarTokens.textMuted, fontFamily: 'inherit', fontSize: 10.75, fontWeight: 500, lineHeight: 1.25 }}>
                    {roleLabel}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </Stack>
        </Tooltip>

        <Tooltip title="ออกจากระบบ" placement={collapsed ? 'right' : 'top'} enterDelay={250}>
          <IconButton
            onClick={onLogout}
            aria-label="ออกจากระบบ"
            sx={{
              width: 40,
              height: 40,
              ml: 0.6,
              flexShrink: 0,
              border: `1px solid ${sidebarTokens.border}`,
              borderRadius: '11px',
              color: sidebarTokens.textMuted,
              bgcolor: sidebarTokens.backgroundElevated,
              transition: `background-color ${sidebarMotion.interaction}, color ${sidebarMotion.interaction}, border-color ${sidebarMotion.interaction}`,
              '&:hover': {
                borderColor: 'rgba(180, 35, 24, 0.2)',
                color: sidebarTokens.danger,
                bgcolor: sidebarTokens.dangerBackground,
              },
              '&:focus-visible': { outline: `2px solid ${sidebarTokens.focusRing}`, outlineOffset: 2 },
            }}>
            <LogoutRoundedIcon aria-hidden="true" sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
