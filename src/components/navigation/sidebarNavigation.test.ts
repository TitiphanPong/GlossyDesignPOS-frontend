import assert from 'node:assert/strict';
import test from 'node:test';
import { SIDEBAR_MENU_GROUPS, SIDEBAR_PRIMARY_ACTION } from './sidebarConfig';
import { filterSidebarGroups, isRouteActive, isSidebarItemActive } from './sidebarNavigation';
import type { SidebarMenuGroup, SidebarNavItem } from './sidebarTypes';

const icon = undefined as unknown as SidebarNavItem['icon'];

test('Quick Seller V1 stays primary while V2 remains a separate pilot entry', () => {
  const salesGroup = SIDEBAR_MENU_GROUPS.find(group => group.id === 'sales');

  assert.equal(SIDEBAR_PRIMARY_ACTION.href, '/home/quick-sale');
  assert.equal(salesGroup?.items[0]?.href, '/home/quick-sale-v2');
});

test('sales keeps V2, POS, orders, and quotations without moving customers back into sales', () => {
  const salesGroup = SIDEBAR_MENU_GROUPS.find(group => group.id === 'sales');
  assert.deepEqual(
    salesGroup?.items.map(item => item.href),
    ['/home/quick-sale-v2', '/home/posseller', '/home/orders', '/home/quotations']
  );
});

test('customer directory has its own customer group', () => {
  const customerGroup = SIDEBAR_MENU_GROUPS.find(group => group.id === 'customers');
  assert.deepEqual(customerGroup?.items.map(item => item.href), ['/home/customers']);
});

test('production exposes focused workflow views before storage and stock', () => {
  const operationsGroup = SIDEBAR_MENU_GROUPS.find(group => group.id === 'operations');
  const production = operationsGroup?.items[0];

  assert.equal(production?.href, '/home/production');
  assert.deepEqual(
    production?.children?.map(item => item.href),
    [
      '/home/production?stage=all',
      '/home/production?stage=queued',
      '/home/production?stage=file_check',
      '/home/production?stage=producing',
      '/home/production?stage=ready',
    ]
  );
  assert.deepEqual(operationsGroup?.items.slice(1).map(item => item.href), ['/home/storage', '/home/stock']);
});

test('system health is available to authenticated staff in management', () => {
  const staffGroups = filterSidebarGroups(SIDEBAR_MENU_GROUPS, 'staff');
  const managementGroup = staffGroups.find(group => group.id === 'management');
  assert.deepEqual(managementGroup?.items.map(item => item.href), ['/home/system-health']);
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

test('query-specific routes require matching query values while allowing extra filters', () => {
  assert.equal(isRouteActive('/home/production?stage=queued', '/home/production?stage=queued'), true);
  assert.equal(isRouteActive('/home/production?stage=queued&due=today', '/home/production?stage=queued'), true);
  assert.equal(isRouteActive('/home/production?stage=ready', '/home/production?stage=queued'), false);
  assert.equal(isRouteActive('/home/production?stage=queued', '/home/production'), true);
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

test('production child active state follows the selected stage query', () => {
  const production = SIDEBAR_MENU_GROUPS.find(group => group.id === 'operations')?.items.find(item => item.id === 'production');
  assert.ok(production);

  const queue = production.children?.find(item => item.id === 'production-queue');
  const pickup = production.children?.find(item => item.id === 'production-pickup');
  assert.ok(queue);
  assert.ok(pickup);

  assert.equal(isSidebarItemActive('/home/production?stage=queued', queue), true);
  assert.equal(isSidebarItemActive('/home/production?stage=queued', pickup), false);
  assert.equal(isSidebarItemActive('/home/production?stage=queued', production), true);
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
