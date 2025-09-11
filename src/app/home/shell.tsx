'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import SideMenu from './components/SideMenu'; // Side navigation
import AppBreadCrumb from './components/AppBreadCrumb'; // Breadcrumb

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* ✅ Layout Container */}
      <Box
        sx={{
          display: 'flex',
          minHeight: '100dvh',
          bgcolor: 'background.default',
          overflow: 'hidden', // ✅ ป้องกัน scrollbar แนวนอน
        }}>
        {/* ✅ Side Menu */}
        <SideMenu currentPath={pathname ?? '/'} />

        {/* ✅ Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            mt: 2,
            px: { xs: 2, md: 3 },
            overflow: 'hidden',
            bgcolor: 'background.default',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
          {/* ✅ Breadcrumb */}
          <AppBreadCrumb />

          {/* ✅ Page Content */}
          <Box
            sx={{
              flex: 1,
              mt: 3,
              px: { xs: 0, md: 0 }, // ไม่มี padding ซ้ำใน container
              overflow: 'auto', // ✅ ให้ scroll ภายในได้ (เช่น ตารางยาว ๆ)
            }}>
            {children}
          </Box>

          {/* ✅ Footer (optional) */}
          {/* <AppFooter /> */}
        </Box>
      </Box>
    </>
  );
}
