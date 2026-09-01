import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
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
    label: 'ภาพรวม',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/home',
        exact: true,
        icon: SpaceDashboardRoundedIcon,
      },
    ],
  },
  {
    id: 'sales',
    label: 'ขาย',
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
        id: 'quotations',
        label: 'ใบเสนอราคา',
        href: '/home/quotations',
        icon: RequestQuoteRoundedIcon,
      },
    ],
  },
  {
    id: 'operations',
    label: 'งาน',
    items: [
      {
        id: 'production',
        label: 'งานผลิต',
        href: '/home/production',
        icon: PrecisionManufacturingRoundedIcon,
        children: [
          {
            id: 'production-all',
            label: 'ทั้งหมด',
            href: '/home/production?stage=all',
            icon: PrecisionManufacturingRoundedIcon,
          },
          {
            id: 'production-queue',
            label: 'Queue',
            href: '/home/production?stage=queued',
            icon: FormatListBulletedRoundedIcon,
          },
          {
            id: 'production-proof',
            label: 'Proof',
            href: '/home/production?stage=file_check',
            icon: FactCheckRoundedIcon,
          },
          {
            id: 'production-running',
            label: 'Production',
            href: '/home/production?stage=producing',
            icon: PrintRoundedIcon,
          },
          {
            id: 'production-pickup',
            label: 'Pickup',
            href: '/home/production?stage=ready',
            icon: ShoppingBagRoundedIcon,
          },
        ],
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
    id: 'customers',
    label: 'ลูกค้า',
    items: [
      {
        id: 'customers',
        label: 'ลูกค้าทั้งหมด',
        href: '/home/customers',
        icon: PeopleAltRoundedIcon,
      },
    ],
  },
  {
    id: 'management',
    label: 'จัดการ',
    items: [
      {
        id: 'quick-menu-settings',
        label: 'เมนูขายด่วน',
        href: '/home/settings/quick-menu',
        icon: DashboardCustomizeRoundedIcon,
        roles: ['manager', 'admin'],
      },
      {
        id: 'staff-management',
        label: 'พนักงานและสิทธิ์',
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
