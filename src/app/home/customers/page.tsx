'use client';

import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import { fetchCustomerDetail, fetchCustomersPage, getCustomerPhoneNumbers, type CustomerDetail, type CustomerProfile } from '@/lib/customers';
import CustomerCreateDialog from '@/components/customers/CustomerCreateDialog';
import CustomerDetailDrawer from '@/components/customers/CustomerDetailDrawer';

type ActiveFilter = 'all' | 'active' | 'inactive';

function branchLabel(customer: CustomerProfile): string | null {
  if (!customer.branchType) return null;
  const normalized = customer.branchType.trim().toLowerCase();
  if (['headquarters', 'head_office', 'head-office', 'สำนักงานใหญ่'].includes(normalized)) return 'สำนักงานใหญ่';
  if (['branch', 'สาขา'].includes(normalized)) return customer.branchNo ? `สาขา ${customer.branchNo}` : 'สาขา';
  return customer.branchNo ? `${customer.branchType} ${customer.branchNo}` : customer.branchType;
}

function CustomerIdentity({ customer }: Readonly<{ customer: CustomerProfile }>) {
  const primaryName = customer.companyName?.trim() || customer.displayName;
  const secondaryName = customer.companyName?.trim() ? customer.displayName : null;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#172033' }} noWrap>
        {primaryName}
      </Typography>
      <Typography sx={{ mt: 0.15, fontSize: 11.5, color: '#718096', fontWeight: 700 }}>{customer.customerCode}</Typography>
      {secondaryName ? (
        <Typography sx={{ mt: 0.35, fontSize: 12, color: '#475569' }} noWrap>
          {secondaryName}
        </Typography>
      ) : null}
    </Box>
  );
}

function CustomerTax({ customer }: Readonly<{ customer: CustomerProfile }>) {
  const branch = branchLabel(customer);
  if (!customer.taxId && !customer.companyName && !branch) return <Typography sx={{ color: '#98A2B3', fontSize: 12 }}>—</Typography>;
  return (
    <Box sx={{ minWidth: 0 }}>
      {customer.taxId ? <Typography sx={{ fontSize: 12.5, color: '#334155', fontWeight: 700 }}>Tax ID {customer.taxId}</Typography> : null}
      {branch ? <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#718096' }}>{branch}</Typography> : null}
    </Box>
  );
}

function CustomerStatus({ active }: Readonly<{ active: boolean }>) {
  return (
    <Chip size="small" label={active ? 'Active' : 'Inactive'} sx={{ height: 24, bgcolor: active ? '#ECFDF3' : '#F2F4F7', color: active ? '#027A48' : '#667085', fontWeight: 800, fontSize: 10.5 }} />
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerProfile[]>([]);
  const [query, setQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<ActiveFilter>('all');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<CustomerProfile | null>(null);
  const listRequestId = React.useRef(0);
  const detailRequestId = React.useRef(0);

  const loadCustomers = React.useCallback(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCustomersPage({
        search: query,
        page: page + 1,
        limit: rowsPerPage,
        active: activeFilter === 'all' ? undefined : activeFilter === 'active',
      });
      if (requestId !== listRequestId.current) return;

      const maxPage = Math.max(0, Math.ceil(response.total / rowsPerPage) - 1);
      if (page > maxPage) {
        setPage(maxPage);
        return;
      }

      setCustomers(response.data);
      setTotal(response.total);
      setLastSyncedAt(new Date());
    } catch (caught) {
      if (requestId !== listRequestId.current) return;
      setError(caught instanceof Error ? caught.message : 'โหลดข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [activeFilter, page, query, rowsPerPage]);

  React.useEffect(() => {
    const timer = globalThis.setTimeout(() => void loadCustomers(), 250);
    return () => globalThis.clearTimeout(timer);
  }, [loadCustomers]);

  const openCustomer = async (customer: CustomerProfile) => {
    const requestId = ++detailRequestId.current;
    setSelectedId(customer._id);
    setSelected(null);
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await fetchCustomerDetail(customer._id);
      if (requestId !== detailRequestId.current) return;
      setSelected(detail);
    } catch (caught) {
      if (requestId !== detailRequestId.current) return;
      setSelectedId(null);
      setError(caught instanceof Error ? caught.message : 'โหลดรายละเอียดลูกค้าไม่สำเร็จ');
    } finally {
      if (requestId === detailRequestId.current) setDetailLoading(false);
    }
  };

  const reloadSelectedCustomer = React.useCallback(async (customerId: string) => {
    try {
      setSelected(await fetchCustomerDetail(customerId));
    } catch {
      setSelected(null);
      setSelectedId(null);
    }
  }, []);

  const handleSaved = async (saved: CustomerProfile) => {
    setEditingCustomer(null);
    await loadCustomers();
    if (selectedId === saved._id) await reloadSelectedCustomer(saved._id);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  const handleFilterChange = (value: ActiveFilter) => {
    setActiveFilter(value);
    setPage(0);
  };

  const customerTableColumns: DataTableColumn<CustomerProfile>[] = [
    {
      key: 'company',
      header: 'บริษัท',
      width: '45%',
      render: customer => <CustomerIdentity customer={customer} />,
    },
    {
      key: 'tax',
      header: 'สาขา / TaxID',
      width: '30%',
      render: customer => <CustomerTax customer={customer} />,
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'right',
      width: '25%',
      render: customer => (
        <Stack direction="row" justifyContent="flex-end" spacing={0.65}>
          <Button
            size="small"
            variant="text"
            startIcon={<VisibilityRoundedIcon />}
            onClick={() => void openCustomer(customer)}
            sx={{ minHeight: 38, borderRadius: 2, textTransform: 'none', fontWeight: 750 }}>
            รายละเอียด
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            onClick={() => setEditingCustomer(customer)}
            sx={{ minHeight: 38, borderRadius: 2, textTransform: 'none', fontWeight: 750 }}>
            แก้ไข
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="ฐานลูกค้า"
        description="จัดการข้อมูลลูกค้า ประวัติการสั่งซื้อ ยอดค้าง และข้อมูลสำหรับออกเอกสาร"
        lastSynced={formatAdminLastSynced(lastSyncedAt)}
        thaiDate={formatAdminThaiDate(lastSyncedAt)}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={heroPrimaryButtonSx}>
            เพิ่มลูกค้า
          </Button>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 3.5, borderColor: '#E5EAF2', boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 1.75 }, '&:last-child': { pb: { xs: 1.5, sm: 1.75 } } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={query}
              onChange={event => handleQueryChange(event.target.value)}
              placeholder="ค้นหาชื่อ/บริษัท รหัสลูกค้า เบอร์โทร อีเมล หรือเลขผู้เสียภาษี"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { minHeight: 44, borderRadius: 2.75, bgcolor: '#fff' } }}
            />
            <TextField
              select
              size="small"
              label="สถานะ"
              value={activeFilter}
              onChange={event => handleFilterChange(event.target.value as ActiveFilter)}
              sx={{ width: { xs: '100%', md: 170 }, '& .MuiOutlinedInput-root': { minHeight: 44, borderRadius: 2.75, bgcolor: '#fff' } }}>
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <Typography sx={{ minWidth: { md: 118 }, textAlign: { xs: 'left', md: 'right' }, color: '#718096', fontSize: 12.5, fontWeight: 700 }}>{total.toLocaleString('th-TH')} รายการ</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ display: { xs: 'none', lg: 'block' }, borderRadius: 3.5, borderColor: '#E5EAF2', boxShadow: 'none' }}>
        <DataTable
          columns={customerTableColumns}
          rows={customers}
          getRowKey={customer => customer._id}
          minWidth={920}
          stickyHeader={false}
          loading={loading && customers.length === 0}
        />
      </Card>

      <Stack spacing={1.1} sx={{ display: { xs: 'flex', lg: 'none' } }}>
        {loading && customers.length === 0 ? Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="rounded" height={172} sx={{ borderRadius: 3 }} />) : null}
        {customers.map(customer => {
          const phones = getCustomerPhoneNumbers(customer);
          const branch = branchLabel(customer);
          return (
            <Card key={customer._id} variant="outlined" sx={{ borderRadius: 3.25, borderColor: '#E5EAF2', boxShadow: 'none' }}>
              <CardContent sx={{ p: 1.65, '&:last-child': { pb: 1.65 } }}>
                <Stack spacing={1.15}>
                  <Stack direction="row" justifyContent="space-between" gap={1.2} alignItems="flex-start">
                    <CustomerIdentity customer={customer} />
                    <CustomerStatus active={customer.active} />
                  </Stack>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.45 }}>
                    <Typography sx={{ fontSize: 12.5, color: '#475569' }}>
                      โทร {phones[0] || 'ไม่มีเบอร์โทร'}
                      {phones.length > 1 ? ` (+${phones.length - 1})` : ''}
                    </Typography>
                    {customer.email ? <Typography sx={{ fontSize: 12.5, color: '#475569', overflowWrap: 'anywhere' }}>{customer.email}</Typography> : null}
                    {customer.taxId ? <Typography sx={{ fontSize: 12.5, color: '#475569' }}>Tax ID {customer.taxId}</Typography> : null}
                    {branch ? <Typography sx={{ fontSize: 12, color: '#718096' }}>{branch}</Typography> : null}
                  </Box>
                  <Stack direction="row" spacing={0.75}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditRoundedIcon />}
                      onClick={() => setEditingCustomer(customer)}
                      sx={{ minHeight: 44, borderRadius: 2.5, textTransform: 'none', fontWeight: 800 }}>
                      แก้ไข
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      disableElevation
                      endIcon={<VisibilityRoundedIcon />}
                      onClick={() => void openCustomer(customer)}
                      sx={{ minHeight: 44, borderRadius: 2.5, textTransform: 'none', fontWeight: 800 }}>
                      รายละเอียด
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {!loading && customers.length === 0 ? (
        <Box sx={{ py: { xs: 6, md: 8 }, px: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 850, color: '#334155' }}>{query.trim() ? `ไม่พบลูกค้าที่ตรงกับ “${query.trim()}”` : 'ยังไม่มีลูกค้าในรายการนี้'}</Typography>
          <Typography sx={{ mt: 0.6, color: '#7A8A9E', fontSize: 13 }}>ลองค้นหาด้วยชื่อ เบอร์โทร หรือรหัสลูกค้า</Typography>
        </Box>
      ) : null}

      <Box sx={{ mt: 1.2, border: '1px solid #E5EAF2', borderRadius: 3, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={event => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="ต่อหน้า"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          sx={{
            '& .MuiTablePagination-toolbar': { minHeight: 56, flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: { xs: 'center', sm: 'flex-end' }, rowGap: 0.5, px: { xs: 1, sm: 2 } },
            '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 12.5 },
          }}
        />
      </Box>

      <CustomerDetailDrawer
        open={Boolean(selectedId)}
        detail={selected}
        loading={detailLoading}
        onClose={() => {
          detailRequestId.current += 1;
          setDetailLoading(false);
          setSelectedId(null);
          setSelected(null);
        }}
        onEdit={customer => setEditingCustomer(customer)}
      />

      <CustomerCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setPage(0);
          void loadCustomers();
        }}
      />

      <CustomerCreateDialog open={Boolean(editingCustomer)} customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSaved={customer => void handleSaved(customer)} />
    </AdminPageContainer>
  );
}
