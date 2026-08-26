'use client';

import { Box } from '@mui/material';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import StatCard from '../../../components/StatCard';

type Props = Readonly<{
  total: number;
  activeCount: number;
  categoryCount: number;
}>;

export default function QuickMenuStats({ total, activeCount, categoryCount }: Props) {
  const inactiveCount = total - activeCount;
  const activePercent = total ? Math.round((activeCount / total) * 100) : 0;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
      <StatCard title="รายการทั้งหมด" value={total} subtitle="เมนูขายด่วนในระบบ" tone="#075BEE" icon={<Inventory2OutlinedIcon />} />
      <StatCard title="กำลังใช้งาน" value={activeCount} subtitle={`${activePercent}% ของทั้งหมด`} tone="#16A34A" icon={<CheckCircleRoundedIcon />} />
      <StatCard title="ปิดใช้งาน" value={inactiveCount} subtitle={`${100 - activePercent}% ของทั้งหมด`} tone="#F59E0B" icon={<PauseCircleOutlineRoundedIcon />} />
      <StatCard title="หมวดหมู่" value={categoryCount} subtitle="หมวดหมู่ที่ใช้งานอยู่" tone="#7139EA" icon={<CategoryRoundedIcon />} />
    </Box>
  );
}
