import { Box, Button, Card, CardContent, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { StorageStatus } from './normalizers';
import type { SortType } from './storageData';

type StorageToolbarProps = {
  search: string;
  statusFilter: 'all' | StorageStatus;
  dateFilter: string;
  sortBy: SortType;
  selectedCount: number;
  bulkUpdating: boolean;
  bulkDeleting: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | StorageStatus) => void;
  onDateChange: (value: string) => void;
  onSortChange: (value: SortType) => void;
  onDownloadSelected: () => void;
  onBulkStatus: () => void;
  onBulkDelete: () => void;
};

export default function StorageToolbar(props: Readonly<StorageToolbarProps>) {
  const {
    search,
    statusFilter,
    dateFilter,
    sortBy,
    selectedCount,
    bulkUpdating,
    bulkDeleting,
    onSearchChange,
    onStatusChange,
    onDateChange,
    onSortChange,
    onDownloadSelected,
    onBulkStatus,
    onBulkDelete,
  } = props;
  const noSelection = selectedCount === 0;

  return (
    <Card sx={{ borderRadius: 4.6, border: '1px solid #E7EDF7', boxShadow: '0 12px 30px rgba(15, 37, 74, 0.08)', background: '#FFFFFF' }}>
      <CardContent sx={{ p: { xs: 1.9, md: 2.3 } }}>
        <Stack spacing={1.8}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.7fr) repeat(3, minmax(180px, 0.8fr))' }, alignItems: 'end', gap: 1.25 }}>
            <OutlinedInput
              value={search}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="ค้นหาชื่อลูกค้า ชื่อ LINE เบอร์โทร ประเภทงาน หรือหมายเหตุ"
              startAdornment={
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: '#6B7A90' }} />
                </InputAdornment>
              }
              sx={{ height: 46, borderRadius: 3, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)', minWidth: 0 }}
            />
            <FormControl size="small">
              <InputLabel id="status-filter">สถานะ</InputLabel>
              <Select<'all' | StorageStatus>
                labelId="status-filter"
                value={statusFilter}
                label="สถานะ"
                onChange={event => onStatusChange(event.target.value)}
                sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="waiting">รอดาวน์โหลด</MenuItem>
                <MenuItem value="pending">รอดำเนินการ</MenuItem>
                <MenuItem value="completed">เสร็จสิ้น</MenuItem>
              </Select>
            </FormControl>
            <DatePicker
              label="วันที่"
              value={dateFilter ? dayjs(dateFilter) : null}
              onChange={value => onDateChange(value?.isValid() ? value.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              disableFuture
              maxDate={dayjs()}
              slotProps={{
                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                field: { clearable: true },
                textField: {
                  size: 'small',
                  sx: {
                    '& .MuiPickersOutlinedInput-root, & .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      height: 46,
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)',
                    },
                  },
                },
              }}
            />
            <FormControl size="small">
              <InputLabel id="sort-filter">เรียงลำดับ</InputLabel>
              <Select<SortType>
                labelId="sort-filter"
                value={sortBy}
                label="เรียงลำดับ"
                onChange={event => onSortChange(event.target.value)}
                sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                <MenuItem value="newest">ล่าสุดก่อน</MenuItem>
                <MenuItem value="oldest">เก่าสุดก่อน</MenuItem>
                <MenuItem value="customer">ชื่อลูกค้า A-Z</MenuItem>
                <MenuItem value="status">สถานะ</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2} useFlexGap alignItems={{ xs: 'stretch', lg: 'center' }} justifyContent="space-between">
            <Typography sx={{ ml: 1, fontSize: 12.5, color: '#7B8797', fontWeight: 500 }}>เลือกหลายรายการเพื่อดาวน์โหลด อัปเดตสถานะ หรือลบออกจากรายการ</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
              <Button
                onClick={onDownloadSelected}
                disabled={noSelection}
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, minWidth: { sm: 156 }, bgcolor: '#215AE8', boxShadow: '0 14px 24px rgba(26, 89, 247, 0.28)' }}>
                ดาวน์โหลดที่เลือก
              </Button>
              <Button
                onClick={onBulkStatus}
                disabled={noSelection || bulkUpdating || bulkDeleting}
                variant="outlined"
                startIcon={<EditNoteRoundedIcon />}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, minWidth: { sm: 180 } }}>
                {bulkUpdating ? 'กำลังอัปเดต...' : 'ตั้งเป็นรอดำเนินการ'}
              </Button>
              <Button
                onClick={onBulkDelete}
                disabled={noSelection || bulkDeleting || bulkUpdating}
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, minWidth: { sm: 132 } }}>
                {bulkDeleting ? 'กำลังลบ...' : 'ลบที่เลือก'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
