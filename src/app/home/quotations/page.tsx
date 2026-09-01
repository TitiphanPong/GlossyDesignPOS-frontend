'use client';

import * as React from 'react';
import Link from 'next/link';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate } from '../components/AdminHeroHeader';
import AdminPageContainer from '../components/AdminPageContainer';
import { fetchOrdersPage } from '@/lib/orders';
import type { NormalizedOrder } from '@/lib/contracts';

const moneyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  timeZone: 'Asia/Bangkok',
  dateStyle: 'medium',
});

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  partial: 'ชำระบางส่วน',
  paid: 'ชำระแล้ว',
  producing: 'กำลังผลิต',
  awaiting_payment: 'รอชำระเงิน',
  ready_for_pickup: 'พร้อมรับสินค้า',
  delivered: 'ส่งมอบแล้ว',
  cancelled: 'ยกเลิก',
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date);
}

function summarizeItems(order: NormalizedOrder): string {
  const names = order.cart.map(item => item.name).filter(Boolean);
  if (names.length === 0) return 'ไม่มีรายละเอียดสินค้า';
  if (names.length <= 2) return names.join(' · ');
  return `${names.slice(0, 2).join(' · ')} และอีก ${names.length - 2} รายการ`;
}

export default function QuotationsPage() {
  const [orders, setOrders] = React.useState<NormalizedOrder[]>([]);
  const [search, setSearch] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setSearchQuery(search.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchOrdersPage({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        sort: 'newest',
      });
      setOrders(response.data.filter(order => order.orderType === 'NORMAL'));
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setOrders([]);
      setError(loadError instanceof Error ? loadError.message : 'โหลดข้อมูลสำหรับใบเสนอราคาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const totalValue = React.useMemo(
    () => orders.reduce((sum, order) => sum + (order.status === 'cancelled' ? 0 : order.grandTotal), 0),
    [orders]
  );

  return (
    <AdminPageContainer>
      <Stack spacing={2.25}>
        <AdminHeroHeader
          title="ใบเสนอราคา"
          description="สร้างใบเสนอราคาจากรายการขายจริงที่มีอยู่แล้ว โดยใช้ข้อมูลลูกค้า สเปกสินค้า และราคาเดียวกับ Order"
          lastSynced={formatAdminLastSynced(lastSyncedAt)}
          thaiDate={formatAdminThaiDate(lastSyncedAt)}
          actions={(
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void load()} disabled={loading}>
              รีเฟรช
            </Button>
          )}
        />

        <Alert severity="info" icon={<RequestQuoteRoundedIcon />} sx={{ borderRadius: 3 }}>
          เวอร์ชันนี้เป็น Quotation Workspace จากข้อมูล Order ปัจจุบัน เพื่อให้เปิด/พิมพ์ใบเสนอราคาได้ทันที ส่วนสถานะ Sent, Approved, Rejected, Expired และ Convert to Order จะเพิ่มเมื่อมี Quotation lifecycle จริงใน Backend
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>รายการที่พร้อมสร้างใบเสนอราคา</Typography>
              <Typography sx={{ mt: 0.35, fontSize: 28, fontWeight: 900 }}>{orders.length.toLocaleString('th-TH')}</Typography>
              <Typography variant="caption" color="text.secondary">แสดงสูงสุด 100 รายการขายปกติล่าสุดตามคำค้น</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>มูลค่ารวมของรายการที่แสดง</Typography>
              <Typography sx={{ mt: 0.35, fontSize: 28, fontWeight: 900 }}>{moneyFormatter.format(totalValue)}</Typography>
              <Typography variant="caption" color="text.secondary">ไม่นับรายการที่ถูกยกเลิก</Typography>
            </CardContent>
          </Card>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="ค้นหาเลข Order, ชื่อลูกค้า หรือเบอร์โทร"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
            />
          </CardContent>
        </Card>

        {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}

        {loading && orders.length === 0 ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!loading && orders.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 6, textAlign: 'center' }}>
              <Typography fontWeight={900}>ไม่พบรายการที่ใช้สร้างใบเสนอราคา</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>ลองเปลี่ยนคำค้น หรือสร้างรายการขายก่อน</Typography>
            </CardContent>
          </Card>
        ) : null}

        <Stack spacing={1}>
          {orders.map(order => (
            <Card key={order._id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" gap={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontSize: 16, fontWeight: 900 }}>{order.orderNumber || order.orderId}</Typography>
                      <Chip size="small" variant="outlined" label={STATUS_LABELS[order.status] ?? order.status} />
                    </Stack>
                    <Typography sx={{ mt: 0.55, fontWeight: 750 }}>{order.customerName || 'ลูกค้าหน้าร้าน'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>
                      {summarizeItems(order)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.55 }}>
                      วันที่ {formatDate(order.saleDate || order.createdAt)}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} gap={0.8} alignItems={{ xs: 'stretch', sm: 'center', md: 'flex-end' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, whiteSpace: 'nowrap' }}>{moneyFormatter.format(order.grandTotal)}</Typography>
                    <Stack direction="row" gap={0.75}>
                      <Button
                        component={Link}
                        href={`/home/orders?focus=${encodeURIComponent(order._id)}`}
                        variant="outlined"
                        size="small"
                        sx={{ whiteSpace: 'nowrap' }}>
                        เปิด Order
                      </Button>
                      <Button
                        component={Link}
                        href={`/print/invoice/${encodeURIComponent(order._id)}?type=quotation`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="small"
                        endIcon={<OpenInNewRoundedIcon />}
                        sx={{ whiteSpace: 'nowrap' }}>
                        เปิดใบเสนอราคา
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </AdminPageContainer>
  );
}
