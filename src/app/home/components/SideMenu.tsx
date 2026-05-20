'use client';

import * as React from 'react';
import Link from 'next/link';
import { Avatar, Box, Drawer, List, ListItemButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { drawerClasses } from '@mui/material/Drawer';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export interface SideMenuProps {
  width?: number;
  currentPath?: string;
  items?: NavItem[];
}

const DEFAULT_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <SpaceDashboardRoundedIcon fontSize="small" /> },
  { label: 'Orders', href: '/orders', icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: 'POS Seller', href: '/pos', icon: <LocalPrintshopRoundedIcon fontSize="small" /> },
  { label: 'Storage', href: '/storage', icon: <FolderCopyRoundedIcon fontSize="small" /> },
];

function isActivePath(currentPath: string, href: string) {
  if (href === '#') return false;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Stack direction="row" spacing={1.1} alignItems="center" sx={{ px: 2.2, py: 2.3 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2.4,
          bgcolor: alpha('#FFFFFF', 0.14),
          border: '1px solid rgba(255,255,255,0.22)',
          display: 'grid',
          placeItems: 'center',
        }}>
        <StarRoundedIcon sx={{ color: '#D8E6FF', fontSize: 18 }} />
      </Box>
      <Box>
        <Typography sx={{ color: '#F8FAFC', fontWeight: 800, fontSize: 14.5, letterSpacing: 0.2 }}>GLOSSY DESIGN</Typography>
        <Typography sx={{ color: 'rgba(235,244,255,0.75)', fontSize: 11.5 }}>ระบบการจัดการหน้าแอดมิน</Typography>
      </Box>
    </Stack>
  );
}

export default function SideMenu({ width = 286, currentPath = '/', items = DEFAULT_ITEMS }: Readonly<SideMenuProps>) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width,
        flexShrink: 0,
        [`& .${drawerClasses.paper}`]: {
          width,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box',
          color: '#E5EEFF',
          background: 'linear-gradient(180deg, #0A1233 0%, #0E1E4F 55%, #15295C 100%)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08), 14px 0 36px rgba(9, 16, 37, 0.32)',
        },
      }}>
      <Stack sx={{ height: '100%' }}>
        <Brand />

        <List sx={{ px: 1.3, py: 0.8, flex: 1 }}>
          {items.map(item => {
            const active = isActivePath(currentPath, item.href);

            return (
              <Tooltip key={item.label} title={item.href === '#' ? 'Coming soon' : item.label} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    mb: 0.8,
                    minHeight: 46,
                    px: 1.35,
                    borderRadius: 3,
                    color: active ? '#FFFFFF' : 'rgba(229, 238, 255, 0.86)',
                    bgcolor: active ? 'rgba(86, 141, 255, 0.26)' : 'transparent',
                    border: active ? '1px solid rgba(139, 181, 255, 0.55)' : '1px solid transparent',
                    boxShadow: active ? '0 16px 26px rgba(32, 97, 222, 0.32)' : 'none',
                    transition: 'all 170ms ease',
                    '&:hover': {
                      bgcolor: active ? 'rgba(86, 141, 255, 0.3)' : 'rgba(255,255,255,0.09)',
                      transform: 'translateY(-1px)',
                    },
                  }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      color: active ? '#FFFFFF' : 'rgba(229, 238, 255, 0.88)',
                      bgcolor: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                      mr: 1.2,
                    }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: active ? 700 : 500 }}>{item.label}</Typography>
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Box sx={{ p: 1.6, pt: 0.8 }}>
          <Box
            sx={{
              borderRadius: 3.5,
              p: 1.35,
              border: '1px solid rgba(147, 173, 233, 0.26)',
              bgcolor: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(6px)',
            }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 34, height: 34, bgcolor: '#6999FF', fontWeight: 700 }}>A</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: '#F8FAFC', fontWeight: 700, fontSize: 13.4 }}>
                  Admin User
                </Typography>
                <Typography noWrap sx={{ color: 'rgba(232,240,255,0.8)', fontSize: 11.4 }}>
                  Printing Shop Staff
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Drawer>
  );
}
