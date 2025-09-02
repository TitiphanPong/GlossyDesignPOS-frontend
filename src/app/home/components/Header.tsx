'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from 'next/link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface HeaderBreadcrumbProps {
  /**
   * เรียกตอนกดปุ่มเมนู (ไว้เปิด Drawer มือถือ)
   */
  onMenuClick?: () => void;
  /**
   * ซ่อนบน Desktop หรือไม่ (ค่าเริ่มต้น: true = แสดงเฉพาะ xs/sm)
   */
  hideOnDesktop?: boolean;
  /**
   * เส้นทาง breadcrumb
   */
  items?: { label: string; href?: string }[];
  /**
   * ใส่ปุ่ม/ตัวเลือกด้านขวา
   */
  rightSlot?: React.ReactNode;
}

export default function HeaderBreadcrumb({
  onMenuClick,
  hideOnDesktop = true,
  items = [{ label: 'Home', href: '/' }],
  rightSlot,
}: HeaderBreadcrumbProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        display: hideOnDesktop ? { xs: 'block', md: 'none' } : 'block',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
      <Toolbar sx={{ gap: 1 }}>
        {onMenuClick && (
          <IconButton edge="start" onClick={onMenuClick} aria-label="menu">
            <MenuRoundedIcon />
          </IconButton>
        )}

        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ fontSize: 14, fontWeight: 500 }}>
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return last ? (
              <Typography key={index} color="text.primary" fontWeight={700}>
                {item.label}
              </Typography>
            ) : (
              <Link key={index} href={item.href ?? '#'} passHref>
                <Typography
                  component="span"
                  sx={{ color: 'text.secondary', '&:hover': { textDecoration: 'underline' } }}>
                  {item.label}
                </Typography>
              </Link>
            );
          })}
        </Breadcrumbs>

        <Box sx={{ ml: 'auto' }}>{rightSlot}</Box>
      </Toolbar>
    </AppBar>
  );
}
