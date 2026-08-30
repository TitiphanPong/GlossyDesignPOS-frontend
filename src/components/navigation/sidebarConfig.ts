import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import type { SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

export const SIDEBAR_PRIMARY_ACTION: SidebarNavItem = {
  id: 'quick-sale',
  label: 'ขายด่วน',
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
      {
        id: 'customers',
        label: 'รายชื่อลูกค้า',
        href: '/home/customers',
        icon: PeopleAltRoundedIcon,
      },
    ],
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [
      {
        id: 'production',
        label: 'งานผลิต',
        href: '/home/production',
        icon: PrecisionManufacturingRoundedIcon,
      },
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
        label: 'สิทธิ์การใช้งานระบบ',
        href: '/home/staff',
        icon: ManageAccountsRoundedIcon,
        roles: ['admin'],
      },
      {
        id: 'system-health',
        label: 'สถานะระบบ',
        href: '/home/system-health',
        icon: HealthAndSafetyRoundedIcon,
      },
    ],
  },
];
