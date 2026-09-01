import type { AdminRole, SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

type NavigationLocation = {
  pathname: string;
  searchParams: URLSearchParams;
};

function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.replace(/\/+$/u, '') || '/';
}

function parseNavigationLocation(value: string): NavigationLocation {
  const withoutHash = value.split('#', 1)[0] || '/';
  const queryIndex = withoutHash.indexOf('?');
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';

  return {
    pathname: normalizePath(pathname || '/'),
    searchParams: new URLSearchParams(search),
  };
}

function matchesRequiredSearchParams(current: URLSearchParams, target: URLSearchParams): boolean {
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) return false;
  }
  return true;
}

export function isRouteActive(pathname: string, menuPath: string, exact = false): boolean {
  if (!menuPath || menuPath === '#') return false;

  const current = parseNavigationLocation(pathname);
  const target = parseNavigationLocation(menuPath);
  const pathMatches = exact
    ? current.pathname === target.pathname
    : current.pathname === target.pathname || current.pathname.startsWith(`${target.pathname}/`);

  if (!pathMatches) return false;
  return matchesRequiredSearchParams(current.searchParams, target.searchParams);
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
