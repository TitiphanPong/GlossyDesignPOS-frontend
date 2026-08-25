import type { AdminRole, SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

function normalizePath(path: string): string {
  const pathOnly = path.split(/[?#]/u, 1)[0] || '/';
  if (pathOnly === '/') return pathOnly;
  return pathOnly.replace(/\/+$/u, '') || '/';
}

export function isRouteActive(pathname: string, menuPath: string, exact = false): boolean {
  if (!menuPath || menuPath === '#') return false;

  const current = normalizePath(pathname);
  const target = normalizePath(menuPath);
  if (exact) return current === target;

  return current === target || current.startsWith(`${target}/`);
}

export function isSidebarItemActive(pathname: string, item: SidebarNavItem): boolean {
  const directPaths = [item.href, ...(item.activePaths ?? [])].filter((path): path is string => Boolean(path));
  if (directPaths.some(path => isRouteActive(pathname, path, item.exact))) return true;
  return item.children?.some(child => isSidebarItemActive(pathname, child)) ?? false;
}

function isRoleAllowed(roles: AdminRole[] | undefined, role: AdminRole | undefined): boolean {
  return !roles || Boolean(role && roles.includes(role));
}

function filterItem(item: SidebarNavItem, role: AdminRole | undefined): SidebarNavItem | null {
  if (!isRoleAllowed(item.roles, role)) return null;

  const children = item.children?.map(child => filterItem(child, role)).filter((child): child is SidebarNavItem => Boolean(child));
  if (item.children && !children?.length && !item.href) return null;

  return children ? { ...item, children } : item;
}

export function filterSidebarGroups(groups: SidebarMenuGroup[], role: AdminRole | undefined): SidebarMenuGroup[] {
  return groups.flatMap(group => {
    const items = group.items.map(item => filterItem(item, role)).filter((item): item is SidebarNavItem => Boolean(item));
    return items.length ? [{ ...group, items }] : [];
  });
}
