import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import type { SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

export const SIDEBAR_PRIMARY_ACTION: SidebarNavItem = {
  id: 'quick-sale',
  label: 'Quick Seller',
  href: '/home/quick-sale',
  icon: BoltRoundedIcon,
};

export const SIDEBAR_MENU_GROUPS: SidebarMenuGroup[] = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    items: [
      {
        id: 'dashboard',
        label: 'แดชบอร์ด',
        href: '/home',
        exact: true,
        icon: SpaceDashboardRoundedIcon,
      },
    ],
  },
  {
    id: 'sales',
    label: 'SALES',
    items: [
      {
        id: 'pos-seller',
        label: 'ขายหน้าร้าน',
        href: '/home/posseller',
        icon: StorefrontRoundedIcon,
      },
      {
        id: 'orders',
        label: 'รายการขาย',
        href: '/home/orders',
        activePaths: ['/home/saleListPage'],
        icon: ReceiptLongRoundedIcon,
      },
    ],
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [
      {
        id: 'storage',
        label: 'คลังไฟล์ลูกค้า',
        href: '/home/storage',
        icon: FolderCopyRoundedIcon,
      },
      {
        id: 'stock',
        label: 'สต็อกวัสดุ',
        href: '/home/stock',
        icon: Inventory2RoundedIcon,
      },
    ],
  },
  {
    id: 'management',
    label: 'MANAGEMENT',
    items: [
      {
        id: 'quick-menu-settings',
        label: 'จัดการเมนูขายด่วน',
        href: '/home/settings/quick-menu',
        icon: DashboardCustomizeRoundedIcon,
        roles: ['manager', 'admin'],
      },
      {
        id: 'staff-management',
        label: 'ทีมและสิทธิ์ใช้งาน',
        href: '/home/staff',
        icon: ManageAccountsRoundedIcon,
        roles: ['admin'],
      },
    ],
  },
];
