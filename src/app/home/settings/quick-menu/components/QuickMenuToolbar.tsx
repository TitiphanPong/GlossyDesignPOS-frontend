'use client';

import { Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import { SearchToolbar } from '../../../components/dashboardUi';
import { commonButtonSx } from '../../../components/adminUi';

export type QuickMenuSort = 'order' | 'name' | 'updated';
export type QuickMenuStatusFilter = 'all' | 'active' | 'inactive';

type Props = Readonly<{
  query: string;
  status: QuickMenuStatusFilter;
  sort: QuickMenuSort;
  reorderMode: boolean;
  busy: boolean;
  selectedCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: QuickMenuStatusFilter) => void;
  onSortChange: (value: QuickMenuSort) => void;
  onToggleReorderMode: () => void;
  onBulkSetActive: (active: boolean) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}>;

export default function QuickMenuToolbar({
  query,
  status,
  sort,
  reorderMode,
  busy,
  selectedCount,
  onQueryChange,
  onStatusChange,
  onSortChange,
  onToggleReorderMode,
  onBulkSetActive,
  onBulkDelete,
  onClearSelection,
}: Props) {
  return (
    <SearchToolbar>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            placeholder="ค้นหาชื่อสินค้า / รหัสสินค้า"
            value={query}
            disabled={reorderMode}
            onChange={event => onQueryChange(event.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ flex: { md: 1.4 } }}
          />
          <FormControl size="small" disabled={reorderMode} sx={{ minWidth: { md: 170 } }}>
            <InputLabel>สถานะ</InputLabel>
            <Select label="สถานะ" value={status} onChange={event => onStatusChange(event.target.value as QuickMenuStatusFilter)}>
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="active">ใช้งาน</MenuItem>
              <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" disabled={reorderMode} sx={{ minWidth: { md: 190 } }}>
            <InputLabel>เรียงลำดับ</InputLabel>
            <Select label="เรียงลำดับ" value={sort} onChange={event => onSortChange(event.target.value as QuickMenuSort)} IconComponent={UnfoldMoreRoundedIcon}>
              <MenuItem value="order">ลำดับการแสดงผล</MenuItem>
              <MenuItem value="name">ชื่อสินค้า</MenuItem>
              <MenuItem value="updated">อัปเดตล่าสุด</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant={reorderMode ? 'contained' : 'outlined'}
            startIcon={<SwapVertRoundedIcon />}
            onClick={onToggleReorderMode}
            disabled={busy}
            sx={{ ...commonButtonSx, textTransform: 'none', flexShrink: 0 }}>
            {reorderMode ? 'เสร็จสิ้นการจัดลำดับ' : 'จัดลำดับ'}
          </Button>
        </Stack>
        {selectedCount > 0 && !reorderMode && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            spacing={1}
            sx={{ p: 1.25, borderRadius: 2.5, bgcolor: '#EFF5FF', border: '1px solid #D7E3F8' }}>
            <Typography fontWeight={700} fontSize={13.5} sx={{ flex: 1, color: '#1D3A6E' }}>
              เลือกแล้ว {selectedCount} รายการ
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button size="small" startIcon={<CheckCircleOutlineRoundedIcon />} disabled={busy} onClick={() => onBulkSetActive(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                เปิดใช้งาน
              </Button>
              <Button size="small" startIcon={<PauseCircleOutlineRoundedIcon />} disabled={busy} onClick={() => onBulkSetActive(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                ปิดใช้งาน
              </Button>
              <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} disabled={busy} onClick={onBulkDelete} sx={{ textTransform: 'none', fontWeight: 700 }}>
                ลบที่เลือก
              </Button>
              <Button size="small" color="inherit" disabled={busy} onClick={onClearSelection} sx={{ textTransform: 'none' }}>
                ยกเลิกการเลือก
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </SearchToolbar>
  );
}
