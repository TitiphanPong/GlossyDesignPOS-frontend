'use client';

import { Alert, Button, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Link from 'next/link';
import AdminHeroHeader, { heroOutlineButtonSx, heroPrimaryButtonSx } from '../AdminHeroHeader';

type DashboardHeaderProps = {
  isRefreshing: boolean;
  loadError: string | null;
  lastSyncedAt: Date | null;
  onRefresh: () => void;
};

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function formatTimestamp(date: Date | null) {
  if (!date) return '-';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatThaiDate(date: Date | null) {
  if (!date) return 'กำลังโหลดวันที่';
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

export default function DashboardHeader({ isRefreshing, loadError, lastSyncedAt, onRefresh }: Readonly<DashboardHeaderProps>) {
  return (
    <AdminHeroHeader
      title="Dashboard"
      description="ติดตามยอดขาย สถานะงาน การรับชำระ และออเดอร์ล่าสุดของร้านในภาพรวมเดียว"
      lastSynced={formatTimestamp(lastSyncedAt)}
      thaiDate={formatThaiDate(lastSyncedAt)}
      notice={
        loadError ? (
          <Alert severity="warning" sx={{ borderRadius: 3, alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              ข้อมูลแดชบอร์ดอาจไม่ครบถ้วน
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {loadError}
            </Typography>
          </Alert>
        ) : null
      }
      actions={
        <>
          <Button onClick={onRefresh} startIcon={<RefreshRoundedIcon />} variant="outlined" disabled={isRefreshing} sx={heroOutlineButtonSx}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button component={Link} href="/home/orders" startIcon={<ReceiptLongRoundedIcon />} variant="outlined" sx={heroOutlineButtonSx}>
            View Orders
          </Button>
          <Button component={Link} href="/home/posseller" startIcon={<AddShoppingCartRoundedIcon />} variant="contained" sx={heroPrimaryButtonSx}>
            Create New Order
          </Button>
        </>
      }
    />
  );
}
