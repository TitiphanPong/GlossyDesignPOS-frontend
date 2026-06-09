'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { isMissingApiBaseError } from '@/lib/api';
import type { NormalizedOrder } from '@/lib/contracts';
import { getOrderStatusConfig, getWorkflowStatusIndex, WORKFLOW_STATUS_SEQUENCE } from '@/lib/order-status';
import { trackOrder } from '@/lib/tracking';

function formatMoney(value: number): string {
  return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function itemSummary(order: NormalizedOrder): string {
  if (order.cart.length === 0) return 'ไม่มีรายละเอียดรายการ';
  const first = order.cart[0];
  const suffix = order.cart.length > 1 ? ` และอีก ${order.cart.length - 1} รายการ` : '';
  return `${first.name} x${first.qty}${suffix}`;
}

function TrackingTimeline({ order }: Readonly<{ order: NormalizedOrder }>) {
  const activeIndex = getWorkflowStatusIndex(order.status);

  return (
    <Stack spacing={1.1}>
      {WORKFLOW_STATUS_SEQUENCE.map((status, index) => {
        const config = getOrderStatusConfig(status);
        const Icon = config.icon;
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <Box key={status} sx={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 1.2, alignItems: 'start' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: done || active ? config.hex : '#E5E7EB',
                color: done || active ? '#FFFFFF' : '#64748B',
                boxShadow: active ? `0 10px 20px ${config.hex}33` : 'none',
              }}>
              <Icon fontSize="small" />
            </Box>
            <Box sx={{ pb: index === WORKFLOW_STATUS_SEQUENCE.length - 1 ? 0 : 1.2, borderBottom: index === WORKFLOW_STATUS_SEQUENCE.length - 1 ? 'none' : '1px solid #EEF2F7' }}>
              <Typography sx={{ fontWeight: active ? 800 : 700, color: active ? config.hex : '#0F172A' }}>{config.label}</Typography>
              <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 13 }}>{config.description}</Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function OrderResultCard({ order }: Readonly<{ order: NormalizedOrder }>) {
  const statusConfig = getOrderStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card sx={{ borderRadius: 4, border: '1px solid #E5EAF3', boxShadow: '0 18px 45px rgba(15,23,42,0.08)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.6 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 700 }}>ORDER</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 900, color: '#0F172A' }}>{order.orderNumber}</Typography>
            <Typography sx={{ mt: 0.4, color: '#64748B' }}>{order.customerName}</Typography>
          </Box>
          <Chip icon={<StatusIcon fontSize="small" />} label={statusConfig.label} color={statusConfig.color} sx={{ fontWeight: 800, borderRadius: 999 }} />
        </Stack>

        <Box sx={{ my: 2, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
          {[
            ['ยอดรวม', formatMoney(order.grandTotal)],
            ['คงเหลือ', formatMoney(order.remainingTotal)],
            ['วันที่รับงาน', formatDate(order.createdAt)],
            ['รายการ', itemSummary(order)],
          ].map(([label, value]) => (
            <Box key={label} sx={{ borderRadius: 2.5, bgcolor: '#F8FAFC', p: 1.2, minHeight: 74 }}>
              <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 700 }}>{label}</Typography>
              <Typography sx={{ mt: 0.5, color: '#0F172A', fontWeight: 800, fontSize: 13.5 }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        <TrackingTimeline order={order} />
      </CardContent>
    </Card>
  );
}

export default function TrackPage() {
  const [query, setQuery] = React.useState('');
  const [orders, setOrders] = React.useState<NormalizedOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('กรุณากรอกเลขที่ออเดอร์หรือเบอร์โทรศัพท์');
      return;
    }

    setLoading(true);
    setError(null);
    setOrders([]);
    try {
      const result = await trackOrder(query);
      setOrders(result);
      if (result.length === 0) {
        setError('ไม่พบออเดอร์ที่ตรงกับข้อมูลนี้');
      }
    } catch (searchError) {
      setError(isMissingApiBaseError(searchError) ? 'ระบบยังไม่ได้ตั้งค่า API สำหรับติดตามออเดอร์' : searchError instanceof Error && searchError.message /* NOSONAR */ ? searchError.message : 'ค้นหาออเดอร์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF4FF 100%)', padding: '20px 14px 40px' }}>
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>
        <Card sx={{ borderRadius: 4, border: '1px solid #E5EAF3', boxShadow: '0 20px 50px rgba(15,23,42,0.08)', mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: '#EAF1FF', color: '#1D4ED8' }}>
                <ReceiptLongRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: 24, sm: 32 }, fontWeight: 900, color: '#0F172A', lineHeight: 1.05 }}>ติดตามออเดอร์</Typography>
                <Typography sx={{ mt: 0.4, color: '#64748B', fontSize: 14 }}>ค้นหาด้วยเลขที่ออเดอร์หรือเบอร์โทรศัพท์</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <TextField
                fullWidth
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') void handleSearch();
                }}
                placeholder="เช่น GD-000123 หรือ 0812345678"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button onClick={() => void handleSearch()} disabled={loading} variant="contained" sx={{ minHeight: 54, px: 3, borderRadius: 2.4, fontWeight: 800 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'ค้นหา'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        <Stack spacing={2}>{orders.map(order => <OrderResultCard key={order._id} order={order} />)}</Stack>
      </Box>
    </main>
  );
}
