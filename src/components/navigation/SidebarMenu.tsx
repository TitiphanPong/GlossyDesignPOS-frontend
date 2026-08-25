'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import SidebarMenuItem from './SidebarMenuItem';
import { isSidebarItemActive } from './sidebarNavigation';
import { sidebarTokens } from './sidebarTheme';
import type { SidebarMenuGroup } from './sidebarTypes';

type SidebarMenuProps = {
  groups: SidebarMenuGroup[];
  currentPath: string;
  collapsed: boolean;
  onNavigate: (href: string) => void;
};

export default function SidebarMenu({ groups, currentPath, collapsed, onNavigate }: Readonly<SidebarMenuProps>) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    const activeParents = groups.flatMap(group => group.items.filter(item => item.children?.length && isSidebarItemActive(currentPath, item)).map(item => item.id));
    if (!activeParents.length) return;

    setExpandedItems(previous => Array.from(new Set([...previous, ...activeParents])));
  }, [currentPath, groups]);

  const handleToggle = React.useCallback((id: string) => {
    setExpandedItems(previous => (previous.includes(id) ? previous.filter(itemId => itemId !== id) : [...previous, id]));
  }, []);

  return (
    <Box
      component="nav"
      aria-label="เมนูหลัก"
      sx={{
        minHeight: 0,
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        px: 1.5,
        pb: 1.4,
        scrollbarWidth: 'thin',
        scrollbarColor: `${sidebarTokens.scrollbar} transparent`,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': { borderRadius: 999, bgcolor: sidebarTokens.scrollbar },
      }}>
      {groups.map((group, groupIndex) => {
        const labelId = `sidebar-group-${group.id}`;
        return (
          <Box component="section" aria-labelledby={collapsed ? undefined : labelId} aria-label={collapsed ? group.label : undefined} key={group.id} sx={{ mt: groupIndex === 0 ? 0.65 : 1.65 }}>
            <Box sx={{ height: 20, display: 'flex', alignItems: 'flex-start' }}>
              {collapsed ? (
                groupIndex > 0 ? (
                  <Box aria-hidden="true" sx={{ width: 24, mx: 'auto', mt: 0.75, borderTop: `1px solid ${sidebarTokens.border}` }} />
                ) : null
              ) : (
                <Typography
                  id={labelId}
                  component="h2"
                  sx={{
                    m: 0,
                    px: 1.2,
                    color: sidebarTokens.textMuted,
                    fontFamily: 'inherit',
                    fontSize: 10.25,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    lineHeight: 1.4,
                  }}>
                  {group.label}
                </Typography>
              )}
            </Box>

            {group.items.map(item => (
              <SidebarMenuItem key={item.id} item={item} currentPath={currentPath} collapsed={collapsed} expanded={expandedItems.includes(item.id)} onToggle={handleToggle} onNavigate={onNavigate} />
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
