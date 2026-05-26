'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, Box, Button, Drawer, IconButton, List, ListItemButton, Stack, Tooltip, Typography } from '@mui/material';
import { drawerClasses } from '@mui/material/Drawer';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useRouter } from 'next/navigation';
import Face2Icon from '@mui/icons-material/Face2';

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export interface SideMenuProps {
  width?: number;
  collapsedWidth?: number;
  currentPath?: string;
  items?: NavItem[];
  variant?: 'permanent' | 'temporary';
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
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

function Brand({ collapsed = false, onToggleCollapsed }: Readonly<{ collapsed?: boolean; onToggleCollapsed?: () => void }>) {
  return (
    <Box sx={{ position: 'relative', px: collapsed ? 1.5 : 2.2, py: 2.3 }}>
      <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Box
          sx={{
            position: 'relative',
            width: 50,
            height: 50,
          }}>
          <img
            src="logo/logo.png"
            alt="Company Logo"
            sizes="50px"
            style={{
              objectFit: 'contain',
              borderRadius: 15,
              display: 'block',
            }}
          />
        </Box>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#F8FAFC', fontWeight: 800, fontSize: 14.5, letterSpacing: 0.2 }}>GLOSSY DESIGN</Typography>
            <Typography sx={{ color: 'rgba(235,244,255,0.75)', fontSize: 11.5 }}>ระบบจัดการหน้าร้าน</Typography>
          </Box>
        )}
      </Stack>

      {onToggleCollapsed && (
        <IconButton
          onClick={onToggleCollapsed}
          size="small"
          sx={{
            position: 'absolute',
            top: '50%',
            right: collapsed ? -16 : -18,
            transform: 'translateY(-50%)',
            width: 26,
            height: 42,
            borderRadius: '999px',
            color: '#D8E6FF',
            bgcolor: 'rgba(22, 40, 91, 0.96)',
            border: '1px solid rgba(160, 189, 255, 0.22)',
            boxShadow: '8px 0 18px rgba(9, 16, 37, 0.28)',
            zIndex: 2,
            p: 0,
            '&:hover': {
              bgcolor: 'rgba(33, 55, 118, 0.98)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 16,
            },
          }}>
          {collapsed ? <ChevronRightRoundedIcon fontSize="small" /> : <ChevronLeftRoundedIcon fontSize="small" />}
        </IconButton>
      )}
    </Box>
  );
}

export default function SideMenu({
  width = 286,
  collapsedWidth = 92,
  currentPath = '/',
  items = DEFAULT_ITEMS,
  variant = 'permanent',
  open = true,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}: Readonly<SideMenuProps>) {
  const router = useRouter();
  const drawerWidth = variant === 'permanent' && collapsed ? collapsedWidth : width;
  const showCollapsedState = variant === 'permanent' && collapsed;

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  }, [router]);

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .${drawerClasses.paper}`]: {
          width: drawerWidth,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box',
          color: '#E5EEFF',
          background: 'linear-gradient(180deg, #0A1233 0%, #0E1E4F 55%, #15295C 100%)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08), 14px 0 36px rgba(9, 16, 37, 0.32)',
          overflowX: 'visible',
          transition: theme =>
            theme.transitions.create('width', {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
        },
      }}>
      <Stack sx={{ height: '100%', overflowX: 'hidden' }}>
        <Brand collapsed={showCollapsedState} onToggleCollapsed={variant === 'permanent' ? onToggleCollapsed : undefined} />

        <List sx={{ px: showCollapsedState ? 1 : 1.3, py: 0.8, flex: 1 }}>
          {items.map(item => {
            const active = isActivePath(currentPath, item.href);

            return (
              <Tooltip key={item.label} title={item.href === '#' ? 'Coming soon' : item.label} placement="right" disableHoverListener={!showCollapsedState}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={onClose}
                  sx={{
                    mb: 0.8,
                    minHeight: 46,
                    px: showCollapsedState ? 1 : 1.35,
                    borderRadius: 3,
                    color: active ? '#FFFFFF' : 'rgba(229, 238, 255, 0.86)',
                    bgcolor: active ? 'rgba(86, 141, 255, 0.26)' : 'transparent',
                    border: active ? '1px solid rgba(139, 181, 255, 0.55)' : '1px solid transparent',
                    boxShadow: active ? '0 16px 26px rgba(32, 97, 222, 0.32)' : 'none',
                    justifyContent: showCollapsedState ? 'center' : 'flex-start',
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
                      mr: showCollapsedState ? 0 : 1.2,
                    }}>
                    {item.icon}
                  </Box>
                  {!showCollapsedState && <Typography sx={{ fontSize: 14, fontWeight: active ? 700 : 500 }}>{item.label}</Typography>}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Box sx={{ p: showCollapsedState ? 1.1 : 1.6, pt: 0.8 }}>
          <Box
            sx={{
              borderRadius: 3.5,
              p: showCollapsedState ? 1 : 1.35,
              border: '1px solid rgba(147, 173, 233, 0.26)',
              bgcolor: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(6px)',
            }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={showCollapsedState ? 'center' : 'flex-start'}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: '#6999FF', fontWeight: 700 }}>
                <Face2Icon fontSize="small" />
              </Avatar>
              {!showCollapsedState && (
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ color: '#F8FAFC', fontWeight: 700, fontSize: 13.4 }}>
                    Admin User
                  </Typography>
                  <Typography noWrap sx={{ color: 'rgba(232,240,255,0.8)', fontSize: 11.4 }}>
                    Printing Shop Staff
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
          {!showCollapsedState && (
            <Button
              onClick={handleLogout}
              fullWidth
              variant="contained"
              startIcon={<LogoutRoundedIcon fontSize="small" />}
              sx={{
                mt: 1.2,
                minWidth: 0,
                minHeight: 36,
                px: 1.4,
                borderRadius: 2.4,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 12.5,
                color: '#FFF5F5',
                bgcolor: 'rgba(255, 107, 107, 0.92)',
                boxShadow: 'none',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.98)',
                  boxShadow: 'none',
                },
              }}>
              Logout
            </Button>
          )}
        </Box>
        {showCollapsedState && (
          <Box sx={{ px: 1, pb: 1 }}>
            <Tooltip title="Logout" placement="right">
              <Button
                onClick={handleLogout}
                variant="contained"
                sx={{
                  minWidth: 0,
                  width: '100%',
                  minHeight: 42,
                  px: 1.4,
                  borderRadius: 3,
                  textTransform: 'none',
                  color: '#FFF5F5',
                  bgcolor: 'rgba(255, 107, 107, 0.92)',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.98)',
                    boxShadow: 'none',
                  },
                }}>
                <LogoutRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
