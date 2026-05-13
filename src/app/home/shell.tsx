'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import SideMenu from './components/SideMenu';

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}>
      <SideMenu currentPath={pathname ?? '/'} />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Box sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
