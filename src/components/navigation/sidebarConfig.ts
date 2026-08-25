import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import type { SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

export const SIDEBAR_PRIMARY_ACTION: SidebarNavItem = {
  id: 'new-sale',
  label: 'ขายหน้าร้าน',
  href: '/home/posseller',
  icon: PointOfSaleRoundedIcon,
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
        id: 'quick-sale',
        label: 'Quick Seller',
        href: '/home/quick-sale',
        icon: PointOfSaleRoundedIcon,
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
        icon: RestaurantMenuRoundedIcon,
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
