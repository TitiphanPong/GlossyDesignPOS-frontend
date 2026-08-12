import { Chip } from '@mui/material';
import { statusChipSx } from '../../../components/adminUi';

export default function QuickSellerStatusChip({ active }: Readonly<{ active: boolean }>) {
  return <Chip size="small" label={active ? 'ใช้งาน' : 'ปิดใช้งาน'} color={active ? 'success' : 'default'} variant={active ? 'filled' : 'outlined'} sx={statusChipSx} />;
}
