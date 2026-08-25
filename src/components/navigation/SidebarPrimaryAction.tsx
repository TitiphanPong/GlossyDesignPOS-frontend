'use client';

import Link from 'next/link';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { isSidebarItemActive } from './sidebarNavigation';
import { sidebarDimensions, sidebarMotion, sidebarTokens } from './sidebarTheme';
import type { SidebarNavItem } from './sidebarTypes';

type SidebarPrimaryActionProps = {
  item: SidebarNavItem;
  currentPath: string;
  collapsed: boolean;
  onNavigate: (href: string) => void;
};

export default function SidebarPrimaryAction({ item, currentPath, collapsed, onNavigate }: Readonly<SidebarPrimaryActionProps>) {
  const active = isSidebarItemActive(currentPath, item);
  const Icon = item.icon;
  if (!item.href) return null;

  const button = (
    <ListItemButton
      component={Link}
      href={item.href}
      onClick={() => onNavigate(item.href as string)}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      sx={{
        position: 'relative',
        minHeight: sidebarDimensions.itemHeight + 2,
        px: 1.45,
        justifyContent: 'flex-start',
        gap: 1.1,
        overflow: 'hidden',
        border: `1px solid ${active ? sidebarTokens.yellow : 'transparent'}`,
        borderRadius: '12px',
        color: '#FFFFFF',
        bgcolor: sidebarTokens.registrationBlack,
        boxShadow: '0 9px 20px rgba(37, 34, 28, 0.12)',
        transition: `transform ${sidebarMotion.interaction}, background-color ${sidebarMotion.interaction}, box-shadow ${sidebarMotion.interaction}`,
        '&::after': {
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0,
          height: 2,
          background: `linear-gradient(90deg, ${sidebarTokens.cyan} 0 25%, ${sidebarTokens.magenta} 25% 50%, ${sidebarTokens.yellow} 50% 75%, ${sidebarTokens.registrationBlack} 75%)`,
          content: '""',
          opacity: 0.92,
        },
        '&:hover': {
          bgcolor: sidebarTokens.textSoft,
          transform: 'translateY(-1px)',
          boxShadow: '0 12px 24px rgba(37, 34, 28, 0.16)',
          '& .sidebar-primary-icon': { transform: 'translateX(1px)' },
        },
        '&.Mui-focusVisible': {
          outline: `2px solid ${sidebarTokens.focusRing}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transitionDuration: '0.01ms',
          '&:hover': { transform: 'none' },
        },
      }}>
      <Box
        className="sidebar-primary-icon"
        sx={{
          width: 24,
          height: 24,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          transition: `transform ${sidebarMotion.icon}`,
        }}>
        <Icon aria-hidden="true" sx={{ fontSize: 21 }} />
      </Box>
      {!collapsed ? <Typography sx={{ minWidth: 0, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{item.label}</Typography> : null}
    </ListItemButton>
  );

  return (
    <Box sx={{ px: 1.5, py: 1.35 }}>
      <Tooltip title={item.label} placement="right" enterDelay={250} disableHoverListener={!collapsed}>
        {button}
      </Tooltip>
    </Box>
  );
}
