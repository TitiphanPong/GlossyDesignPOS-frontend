// app/shell.tsx
'use client';

import * as React from 'react';
import { Box, Container } from '@mui/material';
import { usePathname } from 'next/navigation';
import Header from './components/Header'; // Breadcrumb/หรือ Header ที่คุณทำไว้
import SideMenu from './components/SideMenu'; // เวอร์ชันคอมแพ็คที่ปรับไว้
import AppBreadCrumb from './components/AppBreadCrumb';
import AppFooter from './components/Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      <Header onMenuClick={() => setOpenMobile(true)} />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100dvh',
          bgcolor: 'background.default',
        }}>
        <SideMenu currentPath={pathname ?? '/'} />
        <Box component="main" sx={{ flex: 1, mt: 2, px: { xs: 2, md: 3 } }}>
          {/* ✅ 1. Breadcrumb อยู่นอก Container */}
          <AppBreadCrumb />

          {/* ✅ 2. Container สำหรับเนื้อหาอื่นเท่านั้น */}
          <Box sx={{ flex: 1, mt: 3, px: { xs: 2, md: 3 } }}>
            {' '}
            {/* หรือจะลบทิ้งไปเลยก็ได้ */}
            {children}
          </Box>
          {/* <AppFooter/> */}
        </Box>
      </Box>
    </>
  );
}
