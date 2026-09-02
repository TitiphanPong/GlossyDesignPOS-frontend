'use client';

import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TablePagination,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import AdminHeroHeader, {
  formatAdminLastSynced,
  formatAdminThaiDate,
  heroOutlineButtonSx,
  heroPrimaryButtonSx,
} from '../components/AdminHeroHeader';
import AdminPageContainer from '../components/AdminPageContainer';
import { EmptyState } from '../components/dashboardUi';
import { uiCardSx } from '../components/adminUi';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import {
  fetchQuotations,
  type Quotation,
  type QuotationStatus,
  type QuotationSummary,
} from '@/lib/quotations';
import {
  formatQuotationDate,
  quotationDisplayNumber,
  quotationMoney,
  QuotationStatusChip,
} from './quotationUi';

const STATUS_OPTIONS: Array<{ value: QuotationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'DRAFT', label: 'ร่าง' },
  { value: 'SENT', label: 'รอตอบรับ' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว' },
  { value: 'REJECTED', label: 'ปฏิเสธ' },
  { value: 'EXPIRED', label: 'หมดอายุ' },
  { value: 'CONVERTED', label: 'สร้าง Order แล้ว' },
  { value: 'CANCELLED', label: 'ยกเลิก' },
];

const EMPTY_SUMMARY: QuotationSummary = {
  draft: 0,
  sent: 0,
  approved: 0,
  expired: 0,
  expiring: 0,
  expiringOrExpired: 0,
};

function SummaryCard({ title, value, subtitle }: Readonly<{ title: string; value: number; subtitle: string }>) {
  return (
    <Card sx={uiCardSx}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>{title}</Typography>
        <Typography sx={{ mt: 0.4, fontSize: 28, lineHeight: 1.1, fontWeight: 900 }}>{value.toLocaleString('th-TH')}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </CardContent>
    </Card>
  );
}

function QuotationMobileCard({ quotation }: Readonly<{ quotation: Quotation }>) {
  return (
    <Card sx={uiCardSx}>
      <CardContent sx={{ p: 1.75 }}>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={900} sx={{ overflowWrap: 'anywhere' }}>{quotationDisplayNumber(quotation.quotationNumber)}</Typography>
              <Typography variant="caption" color="text.secondary">Rev.{quotation.revision}</Typography>
            </Box>
            <QuotationStatusChip status={quotation.status} />
          </Stack>
          <Box>
            <Typography fontWeight={800}>{quotation.customerSnapshot.customerName || 'ยังไม่ระบุลูกค้า'}</Typography>
            <Typography variant="body2" color="text.secondary">{quotation.customerSnapshot.phoneNumber || '-'}</Typography>
          </Box>
          {quotation.subject ? <Typography variant="body2">{quotation.subject}</Typography> : null}
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">วันที่ออก</Typography>
              <Typography variant="body2" fontWeight={700}>{formatQuotationDate(quotation.issuedAt)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">ใช้ได้ถึง</Typography>
              <Typography variant="body2" fontWeight={700}>{formatQuotationDate(quotation.validUntil)}</Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontSize: 19, fontWeight: 900, color: '#1D4ED8' }}>{quotationMoney.format(quotation.grandTotal)}</Typography>
          <Stack direction="row" spacing={1}>
            <Button fullWidth component={Link} href={`/home/quotations/${encodeURIComponent(quotation._id)}`} variant="outlined" startIcon={<VisibilityRoundedIcon />}>รายละเอียด</Button>
            <Button fullWidth component={Link} href={`/print/quotation/${encodeURIComponent(quotation._id)}`} target="_blank" variant="outlined" startIcon={<PrintRoundedIcon />}>พิมพ์</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function QuotationsPage() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [rows, setRows] = React.useState<Quotation[]>([]);
  const [summary, setSummary] = React.useState<QuotationSummary>(EMPTY_SUMMARY);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<QuotationStatus | 'all'>('all');
  const [issuedFrom, setIssuedFrom] = React.useState('');
  const [issuedTo, setIssuedTo] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSynced, setLastSynced] = React.useState<Date | null>(null);
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = React.useState<Quotation | null>(null);
  const requestRef = React.useRef(0);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = React.useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchQuotations({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status,
        issuedFrom: issuedFrom || undefined,
        issuedTo: issuedTo || undefined,
        sort: 'newest',
      });
      if (request !== requestRef.current) return;
      setRows(result.data);
      setTotal(result.total);
      setSummary(result.summary);
      setLastSynced(new Date());
    } catch (loadError) {
      if (request !== requestRef.current) return;
      setRows([]);
      setTotal(0);
      setError(loadError instanceof Error ? loadError.message : 'โหลดรายการใบเสนอราคาไม่สำเร็จ');
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [issuedFrom, issuedTo, page, rowsPerPage, search, status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('all');
    setIssuedFrom('');
    setIssuedTo('');
    setPage(0);
  };

  const quotationTableColumns: DataTableColumn<Quotation>[] = [
    {
      key: 'quotationNumber',
      header: 'เลขใบเสนอราคา',
      render: row => <Typography fontWeight={800}>{quotationDisplayNumber(row.quotationNumber)}</Typography>,
    },
    {
      key: 'revision',
      header: 'Revision',
      render: row => `Rev.${row.revision}`,
    },
    {
      key: 'customer',
      header: 'ลูกค้า',
      render: row => (
        <Box>
          <Typography fontWeight={700}>{row.customerSnapshot.customerName || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">{row.customerSnapshot.phoneNumber || '-'}</Typography>
        </Box>
      ),
    },
    {
      key: 'issuedAt',
      header: 'วันที่ออก',
      render: row => formatQuotationDate(row.issuedAt),
    },
    {
      key: 'validUntil',
      header: 'วันหมดอายุ',
      render: row => formatQuotationDate(row.validUntil),
    },
    {
      key: 'grandTotal',
      header: 'ยอดรวม',
      align: 'right',
      render: row => <Typography fontWeight={800}>{quotationMoney.format(row.grandTotal)}</Typography>,
    },
    {
      key: 'status',
      header: 'สถานะ',
      render: row => <QuotationStatusChip status={row.status} />,
    },
    {
      key: 'createdBy',
      header: 'ผู้สร้าง',
      render: row => row.createdBy || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: 140,
      render: row => (
        <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
          <IconButton component={Link} href={`/home/quotations/${encodeURIComponent(row._id)}`} aria-label="ดูรายละเอียดใบเสนอราคา"><VisibilityRoundedIcon fontSize="small" /></IconButton>
          <IconButton component={Link} href={`/print/quotation/${encodeURIComponent(row._id)}`} target="_blank" aria-label="พิมพ์ใบเสนอราคา"><PrintRoundedIcon fontSize="small" /></IconButton>
          <IconButton aria-label="เมนูใบเสนอราคา" onClick={event => { setMenuAnchor(event.currentTarget); setMenuRow(row); }}><MoreHorizRoundedIcon fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageContainer>
      <Stack spacing={2.25}>
        <AdminHeroHeader
          title="ใบเสนอราคา"
          description="Quotation Workspace แยกจาก Order โดยสมบูรณ์ สร้างร่าง ส่ง อนุมัติ แก้ Revision และ Convert เป็น Order ได้จากที่นี่"
          lastSynced={formatAdminLastSynced(lastSynced)}
          thaiDate={formatAdminThaiDate(lastSynced)}
          mb={0}
          notice={error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : undefined}
          actions={
            <>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => void load()} sx={heroOutlineButtonSx}>รีเฟรช</Button>
              <Button component={Link} href="/home/quotations/new" variant="contained" startIcon={<AddRoundedIcon />} sx={heroPrimaryButtonSx}>สร้างใบเสนอราคา</Button>
            </>
          }
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
          <SummaryCard title="Draft" value={summary.draft} subtitle="ร่างที่ยังแก้ไขได้" />
          <SummaryCard title="รอตอบรับ" value={summary.sent} subtitle="ส่งแล้วและยังไม่หมดอายุ" />
          <SummaryCard title="Approved" value={summary.approved} subtitle="พร้อม Convert เป็น Order" />
          <SummaryCard title="ใกล้หมดอายุ / หมดอายุ" value={summary.expiringOrExpired} subtitle={`${summary.expiring} ใกล้หมดอายุ · ${summary.expired} หมดอายุ`} />
        </Box>

        <Card sx={uiCardSx}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 1.4fr) minmax(160px, .6fr) 170px 170px auto' }, gap: 1.1, alignItems: 'center' }}>
              <TextField
                size="small"
                label="ค้นหาใบเสนอราคา"
                placeholder="เลขใบเสนอราคา ลูกค้า เบอร์โทร Tax ID หรือหัวเรื่อง"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
              />
              <TextField select size="small" label="สถานะ" value={status} onChange={event => { setStatus(event.target.value as QuotationStatus | 'all'); setPage(0); }}>
                {STATUS_OPTIONS.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </TextField>
              <TextField size="small" label="วันที่ออก จาก" type="date" value={issuedFrom} onChange={event => { setIssuedFrom(event.target.value); setPage(0); }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField size="small" label="วันที่ออก ถึง" type="date" value={issuedTo} onChange={event => { setIssuedTo(event.target.value); setPage(0); }} slotProps={{ inputLabel: { shrink: true } }} />
              <Button onClick={resetFilters} disabled={!searchInput && status === 'all' && !issuedFrom && !issuedTo}>ล้างตัวกรอง</Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ ...uiCardSx, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography fontWeight={800}>รายการใบเสนอราคา</Typography>
            <Typography variant="body2" color="text.secondary">{total.toLocaleString('th-TH')} รายการตามตัวกรอง</Typography>
          </Box>

          {loading && rows.length === 0 ? (
            <Stack spacing={1} sx={{ p: 2 }}>
              {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="rounded" height={72} />)}
            </Stack>
          ) : null}

          {!loading && rows.length === 0 ? (
            <EmptyState
              icon={<SearchRoundedIcon />}
              eyebrow="ใบเสนอราคา"
              title="ยังไม่มีใบเสนอราคาที่ตรงกับเงื่อนไข"
              subtitle="สร้างใบเสนอราคาใหม่ หรือปรับคำค้นและตัวกรองเพื่อดูรายการอื่น"
              sx={{ m: 2 }}
            />
          ) : null}

          {rows.length > 0 && mobile ? (
            <Stack spacing={1.25} sx={{ p: 1.5 }}>
              {rows.map(row => <QuotationMobileCard key={row._id} quotation={row} />)}
            </Stack>
          ) : null}

          {rows.length > 0 && !mobile ? (
            <DataTable
              columns={quotationTableColumns}
              rows={rows}
              getRowKey={row => row._id}
              minWidth={1040}
              stickyHeader={false}
            />
          ) : null}

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={event => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="ต่อหน้า"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          />
        </Card>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => { setMenuAnchor(null); setMenuRow(null); }}>
        {menuRow ? <MenuItem component={Link} href={`/home/quotations/${encodeURIComponent(menuRow._id)}`}>ดูรายละเอียด</MenuItem> : null}
        {menuRow ? <MenuItem component={Link} href={`/print/quotation/${encodeURIComponent(menuRow._id)}`} target="_blank">พิมพ์ / PDF</MenuItem> : null}
        {menuRow?.status === 'DRAFT' ? <MenuItem component={Link} href={`/home/quotations/${encodeURIComponent(menuRow._id)}?edit=1`}>แก้ไข Draft</MenuItem> : null}
      </Menu>
    </AdminPageContainer>
  );
}
