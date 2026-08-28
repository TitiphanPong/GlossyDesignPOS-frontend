'use client';

import { useEffect, useState } from 'react';
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
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { isMissingApiBaseError } from '@/lib/api';
import {
  buildPublicTrackingTimeline,
  getOrderPrefillFromSearch,
  getTrackingTokenFromSearch,
  PUBLIC_TRACKING_MILESTONE_COPY,
  PublicTrackingResult,
  trackOrder,
  trackOrderByToken,
} from '@/lib/tracking';

function formatDate(value?: string): string {
  if (!value) return 'ยังไม่มีเวลาอัปเดต';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'ยังไม่มีเวลาอัปเดต';
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
  const [secureAccessUsed, setSecureAccessUsed] = useState(false);

  useEffect(() => {
    const search = window.location.search;
    const trackingToken = getTrackingTokenFromSearch(search);
    const prefilledOrder = getOrderPrefillFromSearch(search);
    if (prefilledOrder) setOrderNumber(prefilledOrder);
    if (!trackingToken) return;

    let active = true;
    setLoading(true);
    setError(null);
    void trackOrderByToken(trackingToken)
      .then(trackingResult => {
        if (!active) return;
        setResult(trackingResult);
        setOrderNumber(trackingResult.orderNumber);
        setSecureAccessUsed(true);
      })
      .catch(() => {
        if (!active) return;
        setSecureAccessUsed(false);
        setError('ลิงก์ติดตามนี้ไม่สามารถใช้งานได้ กรุณากรอกเลขที่ออเดอร์และเลขท้ายโทรศัพท์ 4 หลัก หรือแจ้งพนักงาน');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
      setError(
        isMissingApiBaseError(searchError)
          ? 'ระบบยังไม่ได้ตั้งค่า API สำหรับติดตามออเดอร์'
          : 'ไม่พบออเดอร์หรือข้อมูลยืนยันไม่ตรงกัน กรุณาตรวจสอบแล้วลองอีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  const milestoneCopy = result ? PUBLIC_TRACKING_MILESTONE_COPY[result.currentMilestone] : null;
  const timeline = result ? buildPublicTrackingTimeline(result) : [];
  const milestoneColor = result?.currentMilestone === 'cancelled'
    ? 'error'
    : result?.currentMilestone === 'completed'
      ? 'success'
      : result?.currentMilestone === 'ready'
        ? 'secondary'
        : result?.currentMilestone === 'in_progress'
          ? 'primary'
          : 'info';

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF4FF 100%)',
        padding: '24px 14px 48px',
      }}>
      <Box sx={{ maxWidth: 860, mx: 'auto' }}>
        <Card sx={{ borderRadius: 4, border: '1px solid #E5EAF3', boxShadow: '0 20px 50px rgba(15,23,42,0.08)' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: '#EAF1FF', color: '#1D4ED8' }}>
                <ReceiptLongRoundedIcon />
              </Box>
              <Box>
                <Typography component="h1" sx={{ fontSize: { xs: 25, sm: 32 }, fontWeight: 800 }}>
                  ติดตามออเดอร์
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 14 }}>ดูความคืบหน้าของงานตั้งแต่รับออเดอร์จนถึงส่งมอบ</Typography>
              </Box>
            </Stack>

            <Alert icon={<LockOutlinedIcon />} severity="info" sx={{ my: 3, borderRadius: 2.5 }}>
              {secureAccessUsed
                ? 'เปิดสถานะงานจาก QR ที่ออกให้สำหรับออเดอร์นี้แล้ว หากต้องการค้นหารายการอื่นสามารถกรอกข้อมูลด้านล่างได้'
                : 'หากเปิดจาก QR ที่ร้านออกให้ ระบบจะตรวจสอบออเดอร์ให้อัตโนมัติ หรือค้นหาเองด้วยเลขที่ออเดอร์และเลขท้ายโทรศัพท์ 4 หลัก'}
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
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
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

        {error ? <Alert severity="warning" sx={{ mt: 2, borderRadius: 3 }}>{error}</Alert> : null}

        {result && milestoneCopy ? (
          <Card sx={{ mt: 2, borderRadius: 4, border: '1px solid #E5EAF3', boxShadow: '0 18px 45px rgba(15,23,42,0.08)' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} spacing={2}>
                <Box>
                  <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 700 }}>เลขที่ออเดอร์</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: { xs: 22, sm: 26 }, fontWeight: 800 }}>{result.orderNumber}</Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, color: '#64748B' }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 17 }} />
                    <Typography sx={{ fontSize: 13 }}>อัปเดตล่าสุด {formatDate(result.updatedAt ?? result.milestones.at(-1)?.reachedAt)}</Typography>
                  </Stack>
                </Box>
                <Chip label={milestoneCopy.label} color={milestoneColor} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, fontWeight: 700 }} />
              </Stack>

              <Box sx={{ mt: 3, p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC' }}>
                <Typography sx={{ color: '#334155', fontWeight: 700 }}>{milestoneCopy.description}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />
              <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2.5 }}>ความคืบหน้าของงาน</Typography>

              <Stack spacing={0}>
                {timeline.map((item, index) => {
                  const copy = PUBLIC_TRACKING_MILESTONE_COPY[item.milestone];
                  const isCurrent = item.state === 'current' || item.state === 'cancelled';
                  const isComplete = item.state === 'completed';
                  const isLast = index === timeline.length - 1;
                  const Icon = item.state === 'cancelled' ? CancelRoundedIcon : isComplete ? CheckCircleRoundedIcon : isCurrent ? RadioButtonCheckedRoundedIcon : AccessTimeRoundedIcon;

                  return (
                    <Stack key={item.milestone} direction="row" spacing={2} alignItems="stretch">
                      <Stack alignItems="center" sx={{ width: 28, flexShrink: 0 }}>
                        <Box sx={{ color: item.state === 'cancelled' ? 'error.main' : isCurrent ? 'primary.main' : isComplete ? 'success.main' : 'text.disabled', lineHeight: 0 }}>
                          <Icon fontSize="small" />
                        </Box>
                        {!isLast ? <Box sx={{ width: 2, flex: 1, minHeight: 38, my: 0.5, bgcolor: isComplete ? 'success.light' : 'divider' }} /> : null}
                      </Stack>
                      <Box sx={{ pb: isLast ? 0 : 2.5, flex: 1, minWidth: 0 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1 }} justifyContent="space-between">
                          <Typography sx={{ fontWeight: isCurrent ? 800 : 700, color: item.state === 'upcoming' ? 'text.secondary' : 'text.primary' }}>
                            {copy.label}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary', flexShrink: 0 }}>
                            {item.reachedAt ? formatDate(item.reachedAt) : item.state === 'upcoming' ? 'ขั้นตอนถัดไป' : ''}
                          </Typography>
                        </Stack>
                        <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>{copy.description}</Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </main>
  );
}
