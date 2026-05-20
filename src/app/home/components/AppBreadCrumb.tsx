'use client';

import React from 'react';
import {
  alpha,
  Avatar,
  Box,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { usePathname, useRouter } from 'next/navigation';
import ButtonLogout from './LogoutOutline';

const Brand = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" sx={{ p: 2, pb: 1.5, mt: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.15),
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`,
          mr: 1,
          ml: 4,
        }}>
        <StarRoundedIcon fontSize="small" />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          minHeight: 36,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          lineHeight: 1.1,
        }}>
        <Typography variant="body1" fontWeight={600} noWrap sx={{ letterSpacing: 0.1, mt: 1 }}>
          GLOSSY{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            DESIGN
          </Box>
        </Typography>

        <Typography variant="caption" color="text.secondary" noWrap sx={{ mb: 0.8 }}>
          Print & Cashier System
        </Typography>
      </Box>
    </Stack>
  );
};

const drawerItems = [
  { href: '/dashboard', label: 'หน้าแรก', icon: <HomeRoundedIcon /> },
  { href: '/pos', label: 'เมนูชำระสินค้า', icon: <ShoppingCartRoundedIcon /> },
  { href: '/orders', label: 'ใบรายการขาย', icon: <ReceiptLongRoundedIcon /> },
  { href: '/storage', label: 'ไฟล์ลูกค้า', icon: <InsertDriveFileRoundedIcon /> },
];

function DrawerMenu({ onClose }: { onClose: () => void }) {
  return (
    <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Brand />

      <List sx={{ flexGrow: 1, px: 1.5, pt: 0 }}>
        {drawerItems.map(item => (
          <ListItemButton
            key={item.href}
            component="a"
            href={item.href}
            onClick={onClose}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              px: 2,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(4px)',
              },
            }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
              }}
            />
            <ChevronRightRoundedIcon fontSize="small" sx={{ opacity: 0.3 }} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Avatar src={`https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`} sx={{ width: 36, height: 36 }} />
        <Box>
          <Typography variant="body2" fontWeight={600}>
            ADMIN GLOSSY
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Account : glossydesign
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default function AppBreadCrumb() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  let pathnames = pathname.split('/').filter(Boolean);
  if (pathnames[0] === 'home') {
    pathnames = pathnames.slice(1);
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
      }}>
      {isMobile && (
        <>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 0 }}>
            <MenuRoundedIcon />
          </IconButton>
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <DrawerMenu onClose={() => setDrawerOpen(false)} />
          </Drawer>
        </>
      )}

      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        <Link color="inherit" href="/dashboard" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          หน้าหลัก
        </Link>

        {pathnames.map((value, index) => {
          const href = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <Typography color="text.primary" key={href}>
              {getLabel(value)}
            </Typography>
          ) : (
            <Link underline="hover" color="inherit" href={href} key={href}>
              {getLabel(value)}
            </Link>
          );
        })}
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonLogout onLogout={handleLogout} />
      </Box>
    </Box>
  );
}

const labelMap: Record<string, string> = {
  dashboard: 'แดชบอร์ด',
  orders: 'ใบรายการขาย',
  saleListPage: 'ใบรายการขาย',
  pos: 'เมนูชำระสินค้า',
  posseller: 'เมนูชำระสินค้า',
  storage: 'ไฟล์ลูกค้า',
  invoice: 'ใบแจ้งหนี้',
  checkout: 'ชำระเงิน',
};

function getLabel(value: string) {
  return labelMap[value] ?? formatLabel(value);
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
