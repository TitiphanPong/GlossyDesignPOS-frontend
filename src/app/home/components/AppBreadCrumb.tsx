'use client';

import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { usePathname,useRouter } from 'next/navigation';
import ButtonLogout from './LogoutOutline';

export default function AppBreadCrumb() {

  const router = useRouter(); // ✅ ถูกต้อง: อยู่ใน function component
  const pathname = usePathname(); // เช่น "/home/storage"
  let pathnames = pathname.split('/').filter(x => x);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  // ✅ ตัด home ออกไปเลย
  if (pathnames[0] === 'home') {
    pathnames = pathnames.slice(1);
  }

  return (
    <Box sx={{ px: 3, pt: 2 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        {/* Home icon + link */}
        <Link
          color="inherit"
          href="/"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          หน้าหลัก
        </Link>

        {/* Render path ต่อจาก Home */}
        {pathnames.map((value, index) => {
          const href = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <Typography color="text.primary" key={href}>
              {getLabel(value)}
            </Typography>
          ) : (
            <Link underline="hover" color="inherit" href={href} key={href}>
              {getLabel(value)}
            </Link>
          );
        })}
      </Breadcrumbs>
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <ButtonLogout onLogout={handleLogout} />
      </Box>
    </Box>
  );
}

// ✅ Map slug → label ภาษาไทย
const labelMap: Record<string, string> = {
  saleListPage: 'ใบรายการขาย',
  storage: 'ไฟล์ลูกค้า',
  posseller: 'เมนูชำระสินค้า',
  checkout: 'ชำระเงิน',
  dashboard: 'แดชบอร์ด',
};

function getLabel(value: string) {
  return labelMap[value] ?? formatLabel(value);
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
