import { FormControl, TextField, Typography } from '@mui/material';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ReportFilterPanel, { EMPTY_DATE_RANGE, createDateRangeConfig, type ReportDateRangeValue } from '../components/ReportFilterPanel';
import type { StorageStatus } from './normalizers';
import type { SortType } from './storageData';

type StorageToolbarProps = {
  search: string;
  statusFilter: 'all' | StorageStatus;
  dateRange: ReportDateRangeValue;
  sortBy: SortType;
  linkStatusFilter: 'all' | 'linked' | 'unlinked';
  orderReferenceFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | StorageStatus) => void;
  onDateRangeChange: (value: ReportDateRangeValue) => void;
  onSortChange: (value: SortType) => void;
  onLinkStatusChange: (value: 'all' | 'linked' | 'unlinked') => void;
  onOrderReferenceChange: (value: string) => void;
};

export default function StorageToolbar(props: Readonly<StorageToolbarProps>) {
  const {
    search,
    statusFilter,
    dateRange,
    sortBy,
    linkStatusFilter,
    orderReferenceFilter,
    onSearchChange,
    onStatusChange,
    onDateRangeChange,
    onSortChange,
    onLinkStatusChange,
    onOrderReferenceChange,
  } = props;
  const hasActiveFilters = Boolean(search) || statusFilter !== 'all' || dateRange.preset !== 'all' || sortBy !== 'newest' || linkStatusFilter !== 'all' || Boolean(orderReferenceFilter);

  const resetFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onDateRangeChange(EMPTY_DATE_RANGE);
    onSortChange('newest');
    onLinkStatusChange('all');
    onOrderReferenceChange('');
  };

  return (
    <ReportFilterPanel
      title="ค้นหาไฟล์งาน"
      subtitle="ค้นหาและกรองไฟล์งานที่ลูกค้าส่งเข้ามา"
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="ค้นหาชื่อลูกค้า ชื่อ LINE เบอร์โทร ประเภทงาน หรือหมายเหตุ"
      onReset={resetFilters}
      resetDisabled={!hasActiveFilters}
      dateRange={createDateRangeConfig(dateRange, onDateRangeChange, { title: 'วันที่อัปโหลด' })}
      filters={[
        {
          id: 'storage-status-filter',
          label: 'สถานะ',
          value: statusFilter,
          onChange: value => onStatusChange(value as 'all' | StorageStatus),
          options: [
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'waiting', label: 'รอดาวน์โหลด' },
            { value: 'pending', label: 'รอดำเนินการ' },
            { value: 'completed', label: 'เสร็จสิ้น' },
          ],
        },
        {
          id: 'storage-sort-filter',
          label: 'เรียงลำดับ',
          value: sortBy,
          icon: <SortRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />,
          onChange: value => onSortChange(value as SortType),
          options: [
            { value: 'newest', label: 'ล่าสุดก่อน' },
            { value: 'oldest', label: 'เก่าสุดก่อน' },
            { value: 'customer', label: 'ชื่อลูกค้า A-Z' },
            { value: 'status', label: 'สถานะ' },
          ],
        },
        {
          id: 'storage-link-status-filter',
          label: 'การเชื่อม Order',
          value: linkStatusFilter,
          icon: <LinkRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />,
          onChange: value => onLinkStatusChange(value as 'all' | 'linked' | 'unlinked'),
          options: [
            { value: 'all', label: 'ทุกการเชื่อม Order' },
            { value: 'unlinked', label: 'ยังไม่เชื่อม Order' },
            { value: 'linked', label: 'เชื่อม Order แล้ว' },
          ],
        },
      ]}
      extraFilters={
        <FormControl size="small" sx={{ flex: { sm: 1 }, minWidth: { xs: '100%', sm: 260 } }}>
          <Typography sx={{ mb: 0.4, color: '#475569', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>เลขที่ Order</Typography>
          <TextField
            size="small"
            value={orderReferenceFilter}
            onChange={event => onOrderReferenceChange(event.target.value.trim())}
            placeholder="เช่น ORD-0101"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: 48,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
                '&:hover fieldset': { borderColor: '#94A3B8' },
                '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1 },
              },
            }}
          />
        </FormControl>
      }
    />
  );
}
