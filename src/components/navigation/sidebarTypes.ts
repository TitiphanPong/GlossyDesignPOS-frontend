import type SvgIcon from '@mui/material/SvgIcon';

export type AdminRole = 'staff' | 'manager' | 'admin';

export type SidebarNavItem = {
  id: string;
  label: string;
  icon: typeof SvgIcon;
  href?: string;
  activePaths?: string[];
  exact?: boolean;
  roles?: AdminRole[];
  children?: SidebarNavItem[];
};

export type SidebarMenuGroup = {
  id: string;
  label: string;
  items: SidebarNavItem[];
};
