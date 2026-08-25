'use client';

import * as React from 'react';
import Link from 'next/link';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, Collapse, ListItemButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { isSidebarItemActive } from './sidebarNavigation';
import { sidebarDimensions, sidebarMotion, sidebarTokens } from './sidebarTheme';
import type { SidebarNavItem } from './sidebarTypes';

type SidebarMenuItemProps = {
  item: SidebarNavItem;
  currentPath: string;
  collapsed: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  onNavigate: (href: string) => void;
};

type SidebarLinkProps = {
  item: SidebarNavItem;
  currentPath: string;
  collapsed?: boolean;
  nested?: boolean;
  onNavigate: (href: string) => void;
};

function menuButtonSx(active: boolean, collapsed: boolean, nested = false): SxProps<Theme> {
  return {
    position: 'relative',
    minHeight: nested ? sidebarDimensions.compactItemHeight : sidebarDimensions.itemHeight,
    mx: 0,
    mb: 0.35,
    px: nested ? 1.15 : 1.4,
    justifyContent: 'flex-start',
    gap: nested ? 0.85 : 1.05,
    overflow: 'hidden',
    borderRadius: nested ? '9px' : '11px',
    color: active ? sidebarTokens.activeText : sidebarTokens.textSoft,
    bgcolor: active ? sidebarTokens.activeBackground : 'transparent',
    transition: `background-color ${sidebarMotion.interaction}, color ${sidebarMotion.interaction}, transform ${sidebarMotion.interaction}`,
    '&::before': active
      ? {
          position: 'absolute',
          top: nested ? 12 : 9,
          bottom: nested ? 12 : 9,
          left: 0,
          width: 3,
          borderRadius: '0 3px 3px 0',
          background: nested ? sidebarTokens.magenta : `linear-gradient(180deg, ${sidebarTokens.cyan} 0 33%, ${sidebarTokens.magenta} 33% 66%, ${sidebarTokens.yellow} 66%)`,
          content: '""',
        }
      : undefined,
    '&:hover': {
      bgcolor: active ? sidebarTokens.activeBackground : sidebarTokens.hoverBackground,
      transform: collapsed ? 'none' : 'translateX(1px)',
      '& .sidebar-menu-icon': { transform: 'translateX(1px)' },
    },
    '&.Mui-focusVisible': {
      outline: `2px solid ${sidebarTokens.focusRing}`,
      outlineOffset: -2,
      bgcolor: active ? sidebarTokens.activeBackground : sidebarTokens.hoverBackground,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
      '&:hover': { transform: 'none' },
    },
  };
}

function SidebarLink({ item, currentPath, collapsed = false, nested = false, onNavigate }: Readonly<SidebarLinkProps>) {
  const active = isSidebarItemActive(currentPath, item);
  const Icon = item.icon;
  if (!item.href) return null;

  const link = (
    <ListItemButton
      component={Link}
      href={item.href}
      onClick={() => onNavigate(item.href as string)}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      sx={menuButtonSx(active, collapsed, nested)}>
      {nested ? (
        <Box sx={{ width: 15, flexShrink: 0, display: 'grid', placeItems: 'center' }} aria-hidden="true">
          <Box sx={{ width: active ? 6 : 4, height: active ? 6 : 4, borderRadius: '50%', bgcolor: active ? sidebarTokens.magenta : sidebarTokens.textMuted }} />
        </Box>
      ) : (
        <Box
          className="sidebar-menu-icon"
          sx={{
            width: 26,
            height: 26,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: active ? sidebarTokens.text : sidebarTokens.textMuted,
            transition: `transform ${sidebarMotion.icon}, color ${sidebarMotion.interaction}`,
          }}>
          <Icon aria-hidden="true" sx={{ fontSize: 20 }} />
        </Box>
      )}
      {!collapsed ? (
        <Typography
          noWrap
          sx={{
            minWidth: 0,
            flex: 1,
            fontFamily: 'inherit',
            fontSize: nested ? 13.25 : 13.75,
            fontWeight: active ? 700 : 500,
            lineHeight: 1.25,
          }}>
          {item.label}
        </Typography>
      ) : null}
    </ListItemButton>
  );

  return collapsed ? (
    <Tooltip title={item.label} placement="right" enterDelay={250} enterNextDelay={150}>
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export default function SidebarMenuItem({ item, currentPath, collapsed, expanded, onToggle, onNavigate }: Readonly<SidebarMenuItemProps>) {
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(null);
  const hasChildren = Boolean(item.children?.length);
  const active = isSidebarItemActive(currentPath, item);
  const Icon = item.icon;
  const submenuId = `sidebar-submenu-${item.id}`;

  if (!hasChildren) {
    return <SidebarLink item={item} currentPath={currentPath} collapsed={collapsed} onNavigate={onNavigate} />;
  }

  const handleParentClick = (event: React.MouseEvent<HTMLElement>) => {
    if (collapsed) {
      setAnchorElement(event.currentTarget);
      return;
    }
    onToggle(item.id);
  };

  const parentButton = (
    <ListItemButton
      component="button"
      type="button"
      onClick={handleParentClick}
      aria-label={collapsed ? item.label : undefined}
      aria-haspopup={collapsed ? 'menu' : undefined}
      aria-controls={collapsed ? (anchorElement ? submenuId : undefined) : submenuId}
      aria-expanded={collapsed ? Boolean(anchorElement) : expanded}
      sx={menuButtonSx(active, collapsed)}>
      <Box
        className="sidebar-menu-icon"
        sx={{
          width: 26,
          height: 26,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: active ? sidebarTokens.text : sidebarTokens.textMuted,
          transition: `transform ${sidebarMotion.icon}, color ${sidebarMotion.interaction}`,
        }}>
        <Icon aria-hidden="true" sx={{ fontSize: 20 }} />
      </Box>
      {!collapsed ? (
        <>
          <Typography noWrap sx={{ minWidth: 0, flex: 1, textAlign: 'left', fontFamily: 'inherit', fontSize: 13.75, fontWeight: active ? 700 : 500, lineHeight: 1.25 }}>
            {item.label}
          </Typography>
          <ExpandMoreRoundedIcon
            aria-hidden="true"
            sx={{
              flexShrink: 0,
              color: sidebarTokens.textMuted,
              fontSize: 18,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${sidebarMotion.interaction}`,
              '@media (prefers-reduced-motion: reduce)': { transitionDuration: '0.01ms' },
            }}
          />
        </>
      ) : null}
    </ListItemButton>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip title={item.label} placement="right" enterDelay={250} enterNextDelay={150}>
          {parentButton}
        </Tooltip>
      ) : (
        parentButton
      )}

      {!collapsed ? (
        <Collapse in={expanded} timeout={sidebarMotion.menuDuration} unmountOnExit>
          <Box
            id={submenuId}
            role="group"
            aria-label={`เมนูย่อย ${item.label}`}
            sx={{
              position: 'relative',
              ml: 2.1,
              pl: 2.15,
              '&::before': {
                position: 'absolute',
                top: 2,
                bottom: 7,
                left: 13,
                width: '1px',
                bgcolor: sidebarTokens.border,
                content: '""',
              },
            }}>
            {item.children?.map(child => (
              <SidebarLink key={child.id} item={child} currentPath={currentPath} nested onNavigate={onNavigate} />
            ))}
          </Box>
        </Collapse>
      ) : null}

      {collapsed ? (
        <Menu
          id={submenuId}
          anchorEl={anchorElement}
          open={Boolean(anchorElement)}
          onClose={() => setAnchorElement(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          MenuListProps={{ 'aria-label': `เมนูย่อย ${item.label}`, sx: { py: 0.75 } }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 220,
                ml: 1,
                overflow: 'hidden',
                border: `1px solid ${sidebarTokens.border}`,
                borderRadius: '13px',
                bgcolor: sidebarTokens.backgroundElevated,
                boxShadow: sidebarTokens.floatingShadow,
                fontFamily: 'inherit',
              },
            },
          }}>
          <Typography sx={{ px: 1.5, pt: 0.65, pb: 0.75, color: sidebarTokens.textMuted, fontFamily: 'inherit', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>{item.label}</Typography>
          {item.children?.map(child => {
            const ChildIcon = child.icon;
            const childActive = isSidebarItemActive(currentPath, child);
            return child.href ? (
              <MenuItem
                key={child.id}
                component={Link}
                href={child.href}
                selected={childActive}
                aria-current={childActive ? 'page' : undefined}
                onClick={() => {
                  setAnchorElement(null);
                  onNavigate(child.href as string);
                }}
                sx={{
                  mx: 0.75,
                  minHeight: 42,
                  gap: 1,
                  borderRadius: '9px',
                  color: childActive ? sidebarTokens.activeText : sidebarTokens.textSoft,
                  fontFamily: 'inherit',
                  fontSize: 13.5,
                  fontWeight: childActive ? 700 : 500,
                  '&.Mui-selected, &.Mui-selected:hover': { bgcolor: sidebarTokens.activeBackground },
                  '&:hover': { bgcolor: sidebarTokens.hoverBackground },
                }}>
                <ChildIcon aria-hidden="true" sx={{ color: sidebarTokens.textMuted, fontSize: 19 }} />
                {child.label}
              </MenuItem>
            ) : null;
          })}
        </Menu>
      ) : null}
    </>
  );
}
