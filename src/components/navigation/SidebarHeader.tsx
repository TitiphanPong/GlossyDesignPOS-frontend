'use client';

import Link from 'next/link';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import GlossyBrandMark from './GlossyBrandMark';
import { sidebarTokens } from './sidebarTheme';

type SidebarHeaderProps = {
  collapsed: boolean;
  mobile: boolean;
  onToggleCollapsed?: () => void;
  onClose?: () => void;
  onNavigate?: () => void;
};

function RegistrationDots() {
  return (
    <Stack direction="row" spacing="3px" aria-hidden="true">
      {[sidebarTokens.cyan, sidebarTokens.magenta, sidebarTokens.yellow, sidebarTokens.registrationBlack].map(color => (
        <Box key={color} component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: color }} />
      ))}
    </Stack>
  );
}

export default function SidebarHeader({ collapsed, mobile, onToggleCollapsed, onClose, onNavigate }: Readonly<SidebarHeaderProps>) {
  const collapseLabel = collapsed ? 'ขยายเมนูด้านข้าง' : 'ยุบเมนูด้านข้าง';

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        flexShrink: 0,
        px: collapsed ? 0.5 : 1.5,
        pt: mobile ? 'calc(11.2px + env(safe-area-inset-top))' : 1.4,
        pb: 1.4,
        borderBottom: `1px solid ${sidebarTokens.border}`,
      }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={mobile ? 1 : 0.5}>
        <Tooltip title={collapsed ? 'GlossyDesign — แดชบอร์ด' : ''} placement="right" enterDelay={250}>
          <Box
            component={Link}
            href="/home"
            aria-label="GlossyDesign — ไปหน้าแดชบอร์ด"
            onClick={onNavigate}
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              width: 'auto',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 1.15,
              pl: mobile || collapsed ? 0 : 0.6,
              color: sidebarTokens.text,
              textDecoration: 'none',
              borderRadius: '12px',
              '&:focus-visible': {
                outline: `2px solid ${sidebarTokens.focusRing}`,
                outlineOffset: 3,
              },
            }}>
            <GlossyBrandMark size={42} priority />
            {!collapsed ? (
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontFamily: 'inherit', fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                  GlossyDesign
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mt: 0.45 }}>
                  <RegistrationDots />
                  <Typography
                    noWrap
                    sx={{
                      color: sidebarTokens.textMuted,
                      fontFamily: 'inherit',
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.11em',
                      lineHeight: 1.2,
                      textTransform: 'uppercase',
                    }}>
                    Printing Studio
                  </Typography>
                </Stack>
              </Box>
            ) : null}
          </Box>
        </Tooltip>

        {mobile ? (
          <IconButton
            onClick={onClose}
            aria-label="ปิดเมนู"
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              border: `1px solid ${sidebarTokens.border}`,
              color: sidebarTokens.textSoft,
              bgcolor: sidebarTokens.backgroundElevated,
              '&:hover': { bgcolor: sidebarTokens.hoverBackground },
              '&:focus-visible': { outline: `2px solid ${sidebarTokens.focusRing}`, outlineOffset: 2 },
            }}>
            <CloseRoundedIcon sx={{ fontSize: 21 }} />
          </IconButton>
        ) : onToggleCollapsed ? (
          <Tooltip title={collapsed ? collapseLabel : ''} placement="right" enterDelay={250}>
            <IconButton
              onClick={onToggleCollapsed}
              aria-label={collapseLabel}
              size="small"
              sx={{
                width: 20,
                height: 20,
                p: 0,
                flexShrink: 0,
                border: `1px solid ${sidebarTokens.border}`,
                color: sidebarTokens.textSoft,
                bgcolor: sidebarTokens.backgroundElevated,
                '&:hover': { bgcolor: sidebarTokens.hoverBackground },
                '&.Mui-focusVisible': { outline: `2px solid ${sidebarTokens.focusRing}`, outlineOffset: 2 },
              }}>
              {collapsed ? <ChevronRightRoundedIcon aria-hidden="true" sx={{ fontSize: 14 }} /> : <ChevronLeftRoundedIcon aria-hidden="true" sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Box>
  );
}
