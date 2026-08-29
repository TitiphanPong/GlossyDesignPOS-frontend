import assert from 'node:assert/strict';
import test from 'node:test';
import { SIDEBAR_MENU_GROUPS, SIDEBAR_PRIMARY_ACTION } from './sidebarConfig';
import { filterSidebarGroups, isRouteActive, isSidebarItemActive } from './sidebarNavigation';
import type { SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

const icon = undefined as unknown as SidebarNavItem['icon'];

test('quick seller is the primary action and point of sale stays in the sales group', () => {
  const salesGroup = SIDEBAR_MENU_GROUPS.find(group => group.id === 'sales');

  assert.equal(SIDEBAR_PRIMARY_ACTION.href, '/home/quick-sale');
  assert.equal(salesGroup?.items[0]?.href, '/home/posseller');
});

test('production is the first operations destination before storage and stock', () => {
  const operationsGroup = SIDEBAR_MENU_GROUPS.find(group => group.id === 'operations');
  assert.deepEqual(operationsGroup?.items.map(item => item.href), ['/home/production', '/home/storage', '/home/stock']);
});

test('route matching supports child routes without prefix collisions', () => {
  assert.equal(isRouteActive('/home/orders', '/home/orders'), true);
  assert.equal(isRouteActive('/home/orders/123', '/home/orders'), true);
  assert.equal(isRouteActive('/home/orders-history', '/home/orders'), false);
});

test('exact routes and normalized query or trailing slash values are handled', () => {
  assert.equal(isRouteActive('/home/orders/?status=paid', '/home/orders'), true);
  assert.equal(isRouteActive('/home/orders', '/home', true), false);
  assert.equal(isRouteActive('/home/', '/home', true), true);
});

test('active aliases and active descendants mark their owning item active', () => {
  const parent: SidebarNavItem = {
    id: 'management',
    label: 'Management',
    icon,
    children: [
      {
        id: 'orders',
        label: 'Orders',
        href: '/home/orders',
        activePaths: ['/home/saleListPage'],
        icon,
      },
    ],
  };

  assert.equal(isSidebarItemActive('/home/saleListPage', parent), true);
  assert.equal(isSidebarItemActive('/home/storage', parent), false);
});

test('role filtering keeps only reachable groups and children', () => {
  const groups: SidebarMenuGroup[] = [
    {
      id: 'management',
      label: 'MANAGEMENT',
      items: [
        {
          id: 'tools',
          label: 'Tools',
          icon,
          roles: ['manager', 'admin'],
          children: [
            { id: 'settings', label: 'Settings', href: '/settings', icon, roles: ['manager', 'admin'] },
            { id: 'staff', label: 'Staff', href: '/staff', icon, roles: ['admin'] },
          ],
        },
      ],
    },
  ];

  assert.equal(filterSidebarGroups(groups, 'staff').length, 0);
  assert.deepEqual(
    filterSidebarGroups(groups, 'manager')[0]?.items[0]?.children?.map(item => item.id),
    ['settings']
  );
  assert.deepEqual(
    filterSidebarGroups(groups, 'admin')[0]?.items[0]?.children?.map(item => item.id),
    ['settings', 'staff']
  );
});
