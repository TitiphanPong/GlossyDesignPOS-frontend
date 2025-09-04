'use client';

import * as React from 'react';
import Link from 'next/link';
import { styled, keyframes, alpha, useTheme } from '@mui/material/styles';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useRouter } from 'next/navigation';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ButtonLogout from './LogoutOutline';

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  section?: string; // ไว้จัดกลุ่มหัวข้อ
};

export interface SideMenuProps {
  /** ความกว้างโหมดปกติ (px) */
  width?: number;
  /** ความกว้างโหมดย่อ (px) */
  miniWidth?: number;
  /** path ปัจจุบัน (ไว้ทำ active state) */
  currentPath?: string;
  /** รายการเมนูทั้งหมด (รองรับ section) */
  items?: NavItem[];
  /** โปรเจ็กต์/เวิร์คสเปซที่เลือก */
  project?: string;
  projects?: string[];
  onProjectChange?: (value: string) => void;
  /** เริ่มต้นย่อเมนูหรือไม่ */
  defaultCollapsed?: boolean;
  /** callback เวลา toggle ย่อ/ขยาย */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** ปุ่มสลับธีม */
  onToggleTheme?: () => void;
  /** โหมดธีมปัจจุบัน (light/dark) เพื่อแสดงไอคอน) */
  themeMode?: 'light' | 'dark';
}

const DEFAULT_ITEMS: NavItem[] = [
  { section: 'Overview', label: 'หน้าหลัก', href: '/home', icon: <HomeRoundedIcon /> },
  // { section: 'Overview', label: 'Analytics', href: '/analytics', icon: <AnalyticsRoundedIcon />, badge: 'NEW' },
  {
    section: 'Work',
    label: 'เมนูชำระสินค้า',
    href: '/home/posseller',
    icon: <AssignmentRoundedIcon />,
    badge: 7,
  },
  // { section: 'Work', label: 'Task', href: '/home/tasks', icon: <SettingsRoundedIcon /> },
  {
    section: 'Order',
    label: 'ใบรายการขาย',
    href: '/home/saleListPage',
    icon: <AssignmentRoundedIcon />,
  },
  {
    section: 'Order',
    label: 'ไฟล์ลูกค้า',
    href: '/home/storage',
    icon: <InsertDriveFileIcon />,
  },
  // { section: 'System', label: 'About', href: '/about', icon: <InfoRoundedIcon /> },
  // { section: 'System', label: 'Feedback', href: '/feedback', icon: <HelpOutlineRoundedIcon /> },
];

const shimmer = keyframes`
  0%{ background-position: 0% 50% }
  100%{ background-position: 100% 50% }
`;

const float = keyframes`
  0% { transform: translateY(0px) }
  50% { transform: translateY(-2px) }
  100% { transform: translateY(0px) }
`;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: prop => prop !== 'data-collapsed',
})<{ 'data-collapsed'?: boolean }>(({ theme, ['data-collapsed']: collapsed }) => ({
  [`& .${drawerClasses.paper}`]: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backdropFilter: 'blur(8px)',
    backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 40%, transparent 60%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
    backgroundSize: '200% 200%',
    animation: `${shimmer} 16s ease infinite`,
    overflow: 'hidden',
    transition: theme.transitions.create(['width'], { duration: 200 }),
  },
  ...(collapsed && {
    [`& .${drawerClasses.paper}`]: {
      overflowX: 'hidden',
    },
  }),
}));

const Brand = ({ collapsed }: { collapsed: boolean }) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center" // ให้แถวเดียวกันขนานกัน
      sx={{ p: 2, pb: 1.5 }}>
      {/* กล่องไอคอน */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.15),
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`,
          mr: collapsed ? 0 : 1.25,
        }}>
        <StarRoundedIcon fontSize="small" />
      </Box>

      {/* บล็อกข้อความ (กึ่งกลางเท่ากับไอคอน 36px) */}
      {!collapsed && (
        <Box
          sx={{
            minWidth: 0,
            minHeight: 36, // สูงเท่าไอคอน
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // จัดกลางแนวตั้งภายใน 36px
            lineHeight: 1.1,
          }}>
          <Typography
            variant="body1" // ลดความหนาแน่น
            fontWeight={600}
            noWrap
            sx={{ letterSpacing: 0.1 }}>
            GLOSSY{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              DESIGN
            </Box>
          </Typography>

          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
            Print & Cashier System
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

const SectionHeader = ({ text, collapsed }: { text: string; collapsed: boolean }) =>
  collapsed ? null : (
    <ListSubheader
      component="div"
      disableSticky
      sx={{ px: 2.5, py: 1.5, typography: 'overline', color: 'text.secondary' }}>
      {text}
    </ListSubheader>
  );

export default function SideMenu({
  width = 272,
  miniWidth = 84,
  currentPath = '/',
  items = DEFAULT_ITEMS,
  defaultCollapsed = false,
  onCollapsedChange,
  onToggleTheme,
  themeMode = 'light',
}: SideMenuProps) {
  const theme = useTheme();
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // คีย์ลัด Ctrl/Cmd + B เพื่อพับเมนู
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed(c => {
          const next = !c;
          onCollapsedChange?.(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCollapsedChange]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, NavItem[]>();
    items.forEach(it => {
      const sec = it.section ?? 'Main';
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(it);
    });
    return Array.from(map.entries());
  }, [items]);

  const DrawerWidth = collapsed ? miniWidth : width;

  const ItemRow = ({ item }: { item: NavItem }) => {
    const active = currentPath === item.href;
    const content = (
      <ListItemButton
        component={Link}
        href={item.href}
        selected={active}
        sx={{
          borderRadius: 2,
          mx: collapsed ? 1 : 2,
          mb: 0.5,
          py: 0.5,
          position: 'relative',
          transition: theme.transitions.create(['background-color', 'transform'], {
            duration: 150,
          }),
          ...(active && {
            bgcolor: alpha(theme.palette.primary.main, 0.14),
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
          }),
          '&:hover': { transform: 'translateY(-1px)' },
        }}>
        {/* active indicator pill (ซ้าย) */}
        <Box
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: 24,
            borderRadius: 2,
            opacity: active ? 1 : 0,
            transition: theme.transitions.create(['opacity', 'height'], { duration: 200 }),
            background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        />
        <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight={active ? 400 : 300}>{item.label}</Typography>
                {item.badge !== undefined && (
                  <Chip
                    size="small"
                    label={item.badge}
                    sx={{
                      height: 20,
                      '& .MuiChip-label': { px: 0.75, fontSize: 12, fontWeight: 700 },
                    }}
                    color={typeof item.badge === 'number' ? 'primary' : 'secondary'}
                    variant="filled"
                  />
                )}
              </Stack>
            }
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={item.label} placement="right" arrow>
        <Box>{content}</Box>
      </Tooltip>
    ) : (
      content
    );
  };

  return (
    <StyledDrawer
      variant="permanent"
      data-collapsed={collapsed || undefined}
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DrawerWidth,
        flexShrink: 0,
        [`& .${drawerClasses.paper}`]: {
          width: DrawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}>
      {/* ส่วนหัวโลโก้ + ปุ่มควบคุม */}
      <Stack direction="row" alignItems="center" sx={{ px: 1, pt: 1.5 }}>
        <Brand collapsed={collapsed} />
        <Box sx={{ ml: 'auto', pr: 1 }}>
          <Tooltip title={collapsed ? 'ขยายเมนู (Ctrl/Cmd+B)' : 'ย่อเมนู (Ctrl/Cmd+B)'} arrow>
            <IconButton
              size="small"
              onClick={() => {
                const next = !collapsed;
                setCollapsed(next);
                onCollapsedChange?.(next);
              }}>
              {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      {/* เลือกโปรเจ็กต์/เวิร์คสเปซ */}

      {/* เมนูหลัก (จัดกลุ่มตาม section) */}
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}>
        <Box sx={{ overflowY: 'auto', pb: 2 }}>
          {grouped.map(([section, list]) => (
            <List
              key={section}
              subheader={<SectionHeader text={section} collapsed={collapsed} />}
              sx={{ px: 0.5 }}>
              {list.map(item => (
                <ItemRow key={item.href} item={item} />
              ))}
            </List>
          ))}
        </Box>

        {/* เส้นคั่น + ปุ่มลัด */}
        {/* <Divider sx={{ mx: 2, my: 1 }} />
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: collapsed ? 1 : 2, pb: 1 }}
        >
          {collapsed ? (
            <>
              <Tooltip title="สลับธีม" placement="right" arrow>
                <IconButton size="small" onClick={onToggleTheme}>
                  {themeMode === 'dark' ? <Brightness7RoundedIcon /> : <Brightness4RoundedIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="เมนูเพิ่มเติม" placement="right" arrow>
                <IconButton size="small">
                  <MoreVertRoundedIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                onClick={onToggleTheme}
                variant="outlined"
                size="small"
                startIcon={themeMode === 'dark' ? <Brightness7RoundedIcon /> : <Brightness4RoundedIcon />}
                sx={{ borderRadius: 2 }}
              >
                Theme
              </Button>
              <Button variant="text" size="small" startIcon={<MoreVertRoundedIcon />}>
                Quick Actions
              </Button>
            </>
          )}
        </Stack> */}

        {/* โปรไฟล์ผู้ใช้ */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            mt: 'auto',
            p: 2,
            gap: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}>
          <Avatar
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`}
            sx={{ width: 36, height: 36 }}
          />
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                ADMIN GLOSSY
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                Accout : glossydesign
              </Typography>
            </Box>
          )}

          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="เมนูโปรไฟล์" arrow placement="top">
              <IconButton size="small">
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Box>
    </StyledDrawer>
  );
}
