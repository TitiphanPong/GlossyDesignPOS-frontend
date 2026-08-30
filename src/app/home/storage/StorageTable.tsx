import type { MouseEvent } from 'react';
import { Avatar, Box, Card, Checkbox, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { EmptyState } from '../components/dashboardUi';
import type { StorageRow, StorageStatus } from './normalizers';

type StorageTableProps = {
  rows: StorageRow[];
  loading: boolean;
  totalRows: number;
  selectedIds: string[];
  allCurrentSelected: boolean;
  page: number;
  rowsPerPage: number;
  onToggleSelectAll: () => void;
  onRowSelectionChange: (rowId: string, selected: boolean) => void;
  onOpenRow: (row: StorageRow) => void;
  onDownloadRow: (row: StorageRow) => void;
  onCopyFirstFileLink: (row: StorageRow) => void;
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
    selectedIds,
    allCurrentSelected,
    page,
    rowsPerPage,
    onToggleSelectAll,
    onRowSelectionChange,
    onOpenRow,
    onDownloadRow,
    onCopyFirstFileLink,
    onOpenRowMenu,
    onPageChange,
    onRowsPerPageChange,
  } = props;
  return (
    <Card sx={{ borderRadius: 4.8, border: '1px solid #E7EDF8', boxShadow: '0 16px 36px rgba(17, 41, 77, 0.08)', overflow: 'hidden', background: '#FFFFFF' }}>
      <Box sx={{ px: 2.3, py: 1.7, borderBottom: '1px solid #ECF1F8', bgcolor: '#FCFDFF' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 800, color: '#102A43' }}>รายการไฟล์</Typography>
          <Chip label={`${totalRows} รายการ`} sx={{ borderRadius: 2.5, bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #C7D8FE', fontWeight: 800 }} />
        </Stack>
      </Box>
      <TableContainer sx={{ maxHeight: '68vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 52, bgcolor: '#F8FAFE' }}>
                <Checkbox checked={allCurrentSelected} onChange={onToggleSelectAll} />
              </TableCell>
              <TableCell sx={{ minWidth: 164, bgcolor: '#F7FAFF' }}>วันที่อัปโหลด</TableCell>
              <TableCell sx={{ minWidth: 230, bgcolor: '#F7FAFF' }}>ลูกค้า / LINE</TableCell>
              <TableCell sx={{ minWidth: 160, bgcolor: '#F7FAFF' }}>ประเภทงาน</TableCell>
              <TableCell sx={{ minWidth: 260, bgcolor: '#F7FAFF' }}>ตัวอย่างไฟล์</TableCell>
              <TableCell sx={{ minWidth: 130, bgcolor: '#F7FAFF' }}>สถานะ</TableCell>
              <TableCell sx={{ minWidth: 220, bgcolor: '#F7FAFF' }}>หมายเหตุ</TableCell>
              <TableCell sx={{ minWidth: 172, bgcolor: '#F7FAFF' }}>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography sx={{ py: 5, textAlign: 'center', color: '#64748B' }}>กำลังโหลดข้อมูล...</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState compact icon={<SearchRoundedIcon fontSize="small" />} eyebrow="Storage" title="ไม่พบไฟล์งานที่อัปโหลด" subtitle="กรุณาคลิกปุ่ม Refresh อีกครั้งเพื่อโหลดข้อมูลใหม่" />
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows.map(row => {
                const selected = selectedIds.includes(row.id);
                const statusView = statusChip(row.status);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onOpenRow(row)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 100ms ease',
                      '& td': { borderBottomColor: '#EEF2F7' },
                      '&:hover': { bgcolor: '#F7FAFF' },
                    }}>
                    <TableCell onClick={event => event.stopPropagation()}>
                      <Checkbox checked={selected} onChange={event => onRowSelectionChange(row.id, event.target.checked)} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: 13.5 }}>{formatDate(row.uploadDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          src={row.linePictureUrl}
                          alt={row.lineDisplayName === '-' ? row.customerName : row.lineDisplayName}
                          sx={{
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            fontSize: 14,
                            fontWeight: 900,
                            bgcolor: row.lineDisplayName === '-' ? '#F1F5F9' : '#EAFBF0',
                            color: row.lineDisplayName === '-' ? '#64748B' : '#087A3E',
                          }}>
                          {row.lineDisplayName === '-' ? <PersonRoundedIcon sx={{ fontSize: 21 }} /> : (Array.from(row.lineDisplayName)[0] ?? '?')}
                        </Avatar>
                        <Stack spacing={0.45} sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ maxWidth: 165, color: '#1F2937', fontWeight: 800, fontSize: 13.5 }}>
                            {row.customerName}
                          </Typography>
                          {row.lineDisplayName !== '-' ? (
                            <Stack direction="row" spacing={0.65} alignItems="center" sx={{ minWidth: 0 }}>
                              <Chip
                                size="small"
                                label="LINE Official"
                                sx={{ height: 19, borderRadius: 1.5, bgcolor: '#EAFBF0', color: '#087A3E', fontSize: 9.5, fontWeight: 900, '& .MuiChip-label': { px: 0.75 } }}
                              />
                              {row.lineDisplayName === row.customerName ? null : (
                                <Typography noWrap sx={{ maxWidth: 125, color: '#475569', fontSize: 12 }}>
                                  {row.lineDisplayName}
                                </Typography>
                              )}
                            </Stack>
                          ) : null}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.jobType} sx={{ borderRadius: 2.5, fontWeight: 700, ...jobTypeChipSx(row.jobType) }} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.85}>
                        {row.files.slice(0, 2).map(file => (
                          <Stack key={file.id} direction="row" alignItems="center" spacing={0.9}>
                            {file.thumbnail ? (
                              <Box component="img" src={file.thumbnail} alt={file.name} sx={{ width: 34, height: 34, borderRadius: 1.8, objectFit: 'cover', border: '1px solid #E5EAF2' }} />
                            ) : (
                              <Box sx={{ width: 34, height: 34, borderRadius: 1.8, display: 'grid', placeItems: 'center', bgcolor: '#F3F6FC' }}>
                                <FileIcon fileName={file.name} />
                              </Box>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ maxWidth: 160, fontWeight: 600, color: '#1F2937', fontSize: 13 }}>
                                {file.name}
                              </Typography>
                              <Typography sx={{ color: '#94A3B8', fontSize: 11.5 }}>{file.size}</Typography>
                            </Box>
                          </Stack>
                        ))}
                        {row.files.length > 2 && <Typography sx={{ color: '#64748B', fontSize: 12 }}>+{row.files.length - 2} ไฟล์เพิ่มเติม</Typography>}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={statusView.label} sx={{ borderRadius: 2.5, fontWeight: 800, ...statusView.sx }} />
                    </TableCell>
                    <TableCell>
                      <Typography noWrap sx={{ maxWidth: 200, color: '#475569' }}>
                        {row.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={event => event.stopPropagation()}>
                      <Stack direction="row" spacing={0.6}>
                        <Tooltip title="ดูรายละเอียด">
                          <IconButton size="small" onClick={() => onOpenRow(row)}>
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ดาวน์โหลด">
                          <IconButton size="small" onClick={() => onDownloadRow(row)}>
                            <DownloadRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="คัดลอกลิงก์">
                          <IconButton size="small" onClick={() => onCopyFirstFileLink(row)}>
                            <ContentCopyRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ตัวเลือกเพิ่มเติม">
                          <IconButton size="small" onClick={event => onOpenRowMenu(event, row.id)}>
                            <MoreHorizRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={event => onRowsPerPageChange(Number(event.target.value))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="รายการต่อหน้า"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
      />
    </Card>
  );
}
