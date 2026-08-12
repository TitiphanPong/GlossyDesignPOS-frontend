'use client';

import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { getOrderStatusConfig } from '@/lib/order-status';
import { isMissingApiBaseError } from '@/lib/api';
import { PublicTrackingResult, trackOrder } from '@/lib/tracking';

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [result, setResult] = useState<PublicTrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!orderNumber.trim() || !/^\d{4}$/.test(phoneSuffix)) {
      setError('กรุณากรอกเลขที่ออเดอร์และเลขท้ายโทรศัพท์ 4 หลัก');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await trackOrder(orderNumber, phoneSuffix));
    } catch (searchError) {
      setError(isMissingApiBaseError(searchError) ? 'ระบบยังไม่ได้ตั้งค่า API สำหรับติดตามออเดอร์' : 'ไม่พบออเดอร์ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = result ? getOrderStatusConfig(result.status) : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF4FF 100%)',
        padding: '32px 14px 48px',
      }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Card
          sx={{
            borderRadius: 4,
            border: '1px solid #E5EAF3',
            boxShadow: '0 20px 50px rgba(15,23,42,0.08)',
          }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#EAF1FF',
                  color: '#1D4ED8',
                }}>
                <ReceiptLongRoundedIcon />
              </Box>
              <Box>
                <Typography component="h1" sx={{ fontSize: { xs: 25, sm: 32 }, fontWeight: 800 }}>
                  ติดตามออเดอร์
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 14 }}>ตรวจสอบสถานะงานของคุณอย่างปลอดภัย</Typography>
              </Box>
            </Stack>

            <Alert icon={<LockOutlinedIcon />} severity="info" sx={{ my: 3, borderRadius: 2.5 }}>
              ใช้เลขที่ออเดอร์เต็มและเลขท้ายโทรศัพท์ 4 หลักจากใบรับงาน
            </Alert>

            <Stack
              spacing={2}
              component="form"
              onSubmit={event => {
                event.preventDefault();
                void handleSearch();
              }}>
              <TextField
                label="เลขที่ออเดอร์"
                value={orderNumber}
                onChange={event => setOrderNumber(event.target.value)}
                placeholder="เช่น GD-000123"
                autoComplete="off"
                disabled={loading}
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
              <TextField
                label="เลขท้ายโทรศัพท์ 4 หลัก"
                value={phoneSuffix}
                onChange={event => setPhoneSuffix(event.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="เช่น 5678"
                autoComplete="off"
                inputMode="numeric"
                disabled={loading}
                slotProps={{ htmlInput: { maxLength: 4 } }}
              />
              <Button type="submit" disabled={loading} variant="contained" sx={{ minHeight: 52, borderRadius: 2.4, fontWeight: 700 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'ตรวจสอบสถานะ'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        {result && statusConfig && StatusIcon ? (
          <Card sx={{ mt: 2, borderRadius: 4, border: '1px solid #E5EAF3', boxShadow: '0 18px 45px rgba(15,23,42,0.08)' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 700 }}>เลขที่ออเดอร์</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 800 }}>{result.orderNumber}</Typography>
                  <Typography sx={{ mt: 1, color: '#64748B', fontSize: 13 }}>อัปเดตล่าสุด {formatDate(result.updatedAt ?? result.createdAt)}</Typography>
                </Box>
                <Chip icon={<StatusIcon fontSize="small" />} label={statusConfig.label} color={statusConfig.color} sx={{ fontWeight: 700 }} />
              </Stack>
              <Box sx={{ mt: 3, p: 2, borderRadius: 2.5, bgcolor: statusConfig.bg }}>
                <Typography sx={{ color: statusConfig.hex, fontWeight: 700 }}>{statusConfig.description}</Typography>
              </Box>
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </main>
  );
}
