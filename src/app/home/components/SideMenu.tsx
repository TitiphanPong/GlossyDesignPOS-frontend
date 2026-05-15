'use client';

import * as React from 'react';
import Link from 'next/link';
import { alpha, styled } from '@mui/material/styles';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { drawerClasses } from '@mui/material/Drawer';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

export type NavItem = {
  section: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
};

export interface SideMenuProps {
  width?: number;
  miniWidth?: number;
  currentPath?: string;
  items?: NavItem[];
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const DEFAULT_ITEMS: NavItem[] = [
  { section: 'WORK', label: 'Dashboard', href: '/home', icon: <HomeRoundedIcon fontSize="small" /> },
  { section: 'WORK', label: 'POS', href: '/home/posseller', icon: <PointOfSaleRoundedIcon fontSize="small" />, badge: 7 },
  { section: 'WORK', label: 'Customer Files', href: '/home/storage', icon: <FolderCopyRoundedIcon fontSize="small" /> },
  { section: 'ORDER', label: 'Order List', href: '/home/saleListPage', icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { section: 'ORDER', label: 'Print Queue', href: '/home/saleListPage?view=queue', icon: <PrintRoundedIcon fontSize="small" />, badge: 3 },
  { section: 'ORDER', label: 'Production Status', href: '/home/saleListPage?view=production', icon: <PrecisionManufacturingRoundedIcon fontSize="small" /> },
  { section: 'CUSTOMERS', label: 'Customers', href: '/home/storage?view=customers', icon: <Groups2RoundedIcon fontSize="small" /> },
  { section: 'SYSTEM', label: 'Settings', href: '/home/storage?view=settings', icon: <SettingsRoundedIcon fontSize="small" /> },
];

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  [`& .${drawerClasses.paper}`]: {
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    background: '#ffffff',
    boxSizing: 'border-box',
    transition: theme.transitions.create(['width'], { duration: 240 }),
  },
}));

function isActivePath(currentPath: string, href: string) {
  if (href === '/home') return currentPath === '/home';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function Brand({ collapsed }: { collapsed: boolean }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" sx={{ px: 2, pt: 2, pb: 1.5, minHeight: 62 }}>
      <Box sx={{ width: 34, height: 34, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.12), border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`, mr: collapsed ? 0 : 1.2 }}>
        <StarRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} sx={{ fontSize: 14, lineHeight: 1.2 }}>GLOSSY DESIGN</Typography>
          <Typography variant="caption" color="text.secondary">Admin Console</Typography>
        </Box>
      )}
    </Stack>
  );
}

function MenuRow({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const node = (
    <ListItemButton
      component={Link}
      href={item.href}
      sx={(theme) => ({
        height: 40,
        px: collapsed ? 1.2 : 1.4,
        mx: 1.2,
        mb: 0.75,
        borderRadius: 2,
        alignItems: 'center',
        transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], { duration: 160 }),
        bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          transform: 'translateY(-1px)',
          boxShadow: `0 6px 14px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      })}
    >
      <Box sx={(theme) => ({ position: 'absolute', left: -1, top: 8, bottom: 8, width: 3, borderRadius: 2, bgcolor: 'primary.main', opacity: active ? 1 : 0, transition: theme.transitions.create('opacity', { duration: 180 }) })} />
      <ListItemIcon sx={{ minWidth: 28, color: active ? 'primary.main' : 'text.secondary', display: 'grid', placeItems: 'center' }}>{item.icon}</ListItemIcon>
      {!collapsed && (
        <>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? 'text.primary' : 'text.secondary' }} />
          {item.badge !== undefined && (
            <Badge
              badgeContent={item.badge}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  right: 0,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  px: 0.6,
                  fontWeight: 700,
                  fontSize: 11,
                },
              }}
            />
          )}
        </>
      )}
    </ListItemButton>
  );

  return collapsed ? <Tooltip title={item.label} placement="right">{node}</Tooltip> : node;
}

function SidebarContent({
  items,
  currentPath,
  collapsed,
  onToggle,
}: {
  items: NavItem[];
  currentPath: string;
  collapsed: boolean;
  onToggle?: () => void;
}) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, NavItem[]>();
    items.forEach((item) => {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section)?.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" alignItems="center" sx={{ pr: 1 }}>
        <Brand collapsed={collapsed} />
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
            <IconButton size="small" onClick={onToggle}>{collapsed ? <ChevronRightRoundedIcon fontSize="small" /> : <ChevronLeftRoundedIcon fontSize="small" />}</IconButton>
          </Tooltip>
        </Box>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 1 }}>
        {grouped.map(([section, sectionItems], index) => (
          <List
            key={section}
            disablePadding
            subheader={
              collapsed ? undefined : (
                <ListSubheader
                  component="div"
                  disableSticky
                  sx={{
                    bgcolor: 'transparent',
                    px: 2.4,
                    pt: index === 0 ? 0.5 : 2.1,
                    pb: 0.9,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.1,
                    color: 'text.disabled',
                    lineHeight: 1.2,
                  }}
                >
                  {section}
                </ListSubheader>
              )
            }
          >
            {sectionItems.map((item) => (
              <MenuRow key={item.href} item={item} active={isActivePath(currentPath, item.href)} collapsed={collapsed} />
            ))}
          </List>
        ))}
      </Box>

      <Divider />
      <Stack direction="row" alignItems="center" spacing={1.1} sx={{ p: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>Admin</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>glossydesign</Typography>
          </Box>
        )}
      </Stack>
    </Stack>
  );
}

export default function SideMenu({
  width = 272,
  miniWidth = 84,
  currentPath = '/',
  items = DEFAULT_ITEMS,
  defaultCollapsed = false,
  onCollapsedChange,
}: Readonly<SideMenuProps>) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const withCmd = e.ctrlKey || e.metaKey;
      if (withCmd && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((prev) => {
          const next = !prev;
          onCollapsedChange?.(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCollapsedChange]);

  const drawerWidth = collapsed ? miniWidth : width;
  const toggleDesktop = () => {
    setCollapsed((prev) => {
      const next = !prev;
      onCollapsedChange?.(next);
      return next;
    });
  };

  return (
    <StyledDrawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: drawerWidth,
        flexShrink: 0,
        [`& .${drawerClasses.paper}`]: {
          width: drawerWidth,
        },
      }}
    >
      <SidebarContent items={items} currentPath={currentPath} collapsed={collapsed} onToggle={toggleDesktop} />
    </StyledDrawer>
  );
}
