import type { MouseEvent } from 'react';
import { Avatar, Box, Card, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import type { StorageRow, StorageStatus } from './normalizers';

type StorageTableProps = {
  rows: StorageRow[];
  loading: boolean;
  totalRows: number;
  page: number;
  rowsPerPage: number;
  onOpenRow: (row: StorageRow) => void;
  onDownloadRow: (row: StorageRow) => void;
  onOpenRowMenu: (event: MouseEvent<HTMLButtonElement>, rowId: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status: StorageStatus) {
  if (status === 'pending') return 'รอดำเนินการ';
  if (status === 'completed') return 'เสร็จสิ้น';
  return 'รอดาวน์โหลด';
}

function statusChip(status: StorageStatus) {
  if (status === 'pending') return { label: statusLabel(status), sx: { color: '#9A5B00', bgcolor: '#FFF1DB', border: '1px solid #F6C97A' } };
  if (status === 'completed') return { label: statusLabel(status), sx: { color: '#0F6B46', bgcolor: '#E8F8EF', border: '1px solid #9EDCBD' } };
  return { label: statusLabel(status), sx: { color: '#475467', bgcolor: '#F5F7FA', border: '1px solid #D8E0EA' } };
}

function jobTypeChipSx(jobType: string) {
  const normalized = jobType.toLowerCase();
  if (normalized.includes('document') || normalized.includes('เอกสาร')) return { color: '#1D4ED8', bgcolor: '#DBEAFE', border: '1px solid #93C5FD' };
  if (normalized.includes('sticker') || normalized.includes('สติกเกอร์') || normalized.includes('สติ๊กเกอร์')) return { color: '#8A3FFC', bgcolor: '#F3E8FF', border: '1px solid #D9B8FF' };
  if (normalized.includes('banner') || normalized.includes('vinyl') || normalized.includes('ไวนิล') || normalized.includes('ป้าย'))
    return { color: '#9A3412', bgcolor: '#FFF1E8', border: '1px solid #F8C9B0' };
  if (normalized.includes('business') || normalized.includes('namecard') || normalized.includes('นามบัตร')) return { color: '#0F5B7A', bgcolor: '#E7F6FD', border: '1px solid #B8E4F7' };
  if (normalized.includes('packaging') || normalized.includes('binding') || normalized.includes('เข้าเล่ม')) return { color: '#166534', bgcolor: '#ECFDF3', border: '1px solid #BBE7D0' };
  if (normalized.includes('other') || normalized.includes('อื่น')) return { color: '#B45309', bgcolor: '#FEF3C7', border: '1px solid #FCD34D' };
  return { color: '#334155', bgcolor: '#EEF2FF', border: '1px solid #CFD8F6' };
}

function FileIcon({ fileName }: Readonly<{ fileName: string }>) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return <ImageRoundedIcon sx={{ color: '#2A6BF6', fontSize: 18 }} />;
  if (extension === 'pdf') return <DescriptionRoundedIcon sx={{ color: '#E5484D', fontSize: 18 }} />;
  return <InsertDriveFileRoundedIcon sx={{ color: '#6D7B8A', fontSize: 18 }} />;
}

export default function StorageTable(props: Readonly<StorageTableProps>) {
  const {
    rows,
    loading,
    totalRows,
    page,
    rowsPerPage,
    onOpenRow,
    onDownloadRow,
    onOpenRowMenu,
    onPageChange,
    onRowsPerPageChange,
  } = props;
  const columns: DataTableColumn<StorageRow>[] = [
    { key: 'uploadedAt', header: 'วันที่อัปโหลด', width: 164, render: row => <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: 13.5 }}>{formatDate(row.uploadDate)}</Typography> },
    {
      key: 'customer', header: 'ลูกค้า / LINE', width: 230, render: row => (
        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar src={row.linePictureUrl} alt={row.lineDisplayName === '-' ? row.customerName : row.lineDisplayName} sx={{ width: 38, height: 38, flexShrink: 0, fontSize: 14, fontWeight: 900, bgcolor: row.lineDisplayName === '-' ? '#F1F5F9' : '#EAFBF0', color: row.lineDisplayName === '-' ? '#64748B' : '#087A3E' }}>
            {row.lineDisplayName === '-' ? <PersonRoundedIcon sx={{ fontSize: 21 }} /> : (Array.from(row.lineDisplayName)[0] ?? '?')}
          </Avatar>
          <Stack spacing={0.45} sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ maxWidth: 165, color: '#1F2937', fontWeight: 800, fontSize: 13.5 }}>{row.customerName}</Typography>
            {row.lineDisplayName !== '-' ? <Typography noWrap sx={{ maxWidth: 165, color: '#087A3E', fontSize: 12, fontWeight: 700 }}>LINE · {row.lineDisplayName}</Typography> : null}
          </Stack>
        </Stack>
      ),
    },
    { key: 'jobType', header: 'ประเภทงาน', width: 160, render: row => <Chip label={row.jobType} sx={{ borderRadius: 2.5, fontWeight: 700, ...jobTypeChipSx(row.jobType) }} /> },
    {
      key: 'files', header: 'ตัวอย่างไฟล์', width: 260, render: row => (
        <Stack spacing={0.85}>
          {row.files.slice(0, 2).map(file => (
            <Stack key={file.id} direction="row" alignItems="center" spacing={0.9}>
              {file.thumbnail ? <Box component="img" src={file.thumbnail} alt={file.name} sx={{ width: 34, height: 34, borderRadius: 1.8, objectFit: 'cover', border: '1px solid #E5EAF2' }} /> : <Box sx={{ width: 34, height: 34, borderRadius: 1.8, display: 'grid', placeItems: 'center', bgcolor: '#F3F6FC' }}><FileIcon fileName={file.name} /></Box>}
              <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ maxWidth: 160, fontWeight: 600, color: '#1F2937', fontSize: 13 }}>{file.name}</Typography><Typography sx={{ color: '#94A3B8', fontSize: 11.5 }}>{file.size}</Typography></Box>
            </Stack>
          ))}
          {row.files.length > 2 ? <Typography sx={{ color: '#64748B', fontSize: 12 }}>+{row.files.length - 2} ไฟล์เพิ่มเติม</Typography> : null}
        </Stack>
      ),
    },
    { key: 'status', header: 'สถานะ', width: 130, render: row => { const view = statusChip(row.status); return <Chip label={view.label} sx={{ borderRadius: 2.5, fontWeight: 800, ...view.sx }} />; } },
    { key: 'notes', header: 'หมายเหตุ', width: 220, render: row => <Typography noWrap sx={{ maxWidth: 200, color: '#475569' }}>{row.notes || '-'}</Typography> },
    {
      key: 'actions', header: 'จัดการ', align: 'right', width: 132, render: row => (
        <Stack direction="row" spacing={0.4} justifyContent="flex-end" onClick={event => event.stopPropagation()}>
          <Tooltip title="ดูรายละเอียด"><IconButton size="small" onClick={() => onOpenRow(row)}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="ดาวน์โหลด"><IconButton size="small" onClick={() => onDownloadRow(row)}><DownloadRoundedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="จัดการ"><IconButton size="small" onClick={event => onOpenRowMenu(event, row.id)}><MoreHorizRoundedIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 4.5, border: '1px solid #E7EDF8', boxShadow: '0 12px 30px rgba(15, 37, 74, 0.08)', overflow: 'hidden', background: '#FFFFFF' }}>
      <DataTable
        sectionHeader={{
          title: 'รายการไฟล์ทั้งหมด',
          subtitle: `${totalRows.toLocaleString('th-TH')} รายการตามตัวกรองล่าสุด`,
          countLabel: `${totalRows.toLocaleString('th-TH')} รายการ`,
        }}
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        onRowClick={onOpenRow}
        minWidth={1320}
        maxHeight="68vh"
        loading={loading}
        emptyState={{ eyebrow: 'Storage', title: 'ไม่พบไฟล์งานที่อัปโหลด', subtitle: 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง แล้วโหลดข้อมูลอีกครั้ง' }}
        pagination={{ count: totalRows, page, rowsPerPage, onPageChange, onRowsPerPageChange, rowsPerPageOptions: [10, 25, 50, 100] }}
      />
    </Card>
  );
}
