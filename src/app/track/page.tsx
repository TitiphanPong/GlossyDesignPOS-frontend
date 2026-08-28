'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GlossyBrandMark from '@/components/navigation/GlossyBrandMark';
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
      setError(isMissingApiBaseError(searchError) ? 'ระบบยังไม่ได้ตั้งค่า API สำหรับติดตามออเดอร์' : 'ไม่พบออเดอร์หรือข้อมูลยืนยันไม่ตรงกัน กรุณาตรวจสอบแล้วลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const milestoneCopy = result ? PUBLIC_TRACKING_MILESTONE_COPY[result.currentMilestone] : null;
  const timeline = result ? buildPublicTrackingTimeline(result) : [];
  const milestoneColor =
    result?.currentMilestone === 'cancelled'
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
        background: 'linear-gradient(180deg, #F7F9FC 0%, #EEF3FA 100%)',
        padding: 'max(12px, env(safe-area-inset-top)) 12px max(40px, env(safe-area-inset-bottom))',
      }}>
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Card
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 3, sm: 4 },
            border: '1px solid #DCE4F0',
            boxShadow: '0 20px 55px rgba(15, 35, 70, 0.10)',
          }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              px: { xs: 2.25, sm: 4 },
              pt: { xs: 2.25, sm: 3.5 },
              pb: { xs: 2.5, sm: 3.75 },
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #0B3478 0%, #145FD7 100%)',
              '&::after': {
                position: 'absolute',
                right: -58,
                bottom: -82,
                width: 190,
                height: 190,
                border: '34px solid rgba(255,255,255,0.07)',
                borderRadius: '50%',
                content: '""',
              },
            }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 1, mb: 2.25 }}>
              <GlossyBrandMark size={42} priority />
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>Glossy Design</Typography>
                <Typography sx={{ mt: 0.25, color: 'rgba(255,255,255,0.72)', fontSize: 11.5 }}>ORDER TRACKING</Typography>
              </Box>
            </Stack>

            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
              <Typography component="h1" sx={{ fontSize: { xs: 28, sm: 36 }, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.15 }}>
                เช็กสถานะงานของคุณ
              </Typography>
              <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.82)', fontSize: { xs: 14, sm: 15.5 }, lineHeight: 1.65 }}>ดูความคืบหน้าล่าสุด ตั้งแต่ร้านรับออเดอร์จนพร้อมรับงาน</Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2.25, sm: 4 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                gap: 1.25,
                alignItems: 'start',
                mb: { xs: 3, sm: 3.5 },
                p: { xs: 1.5, sm: 1.75 },
                border: '1px solid #D7E6FA',
                borderRadius: 2.5,
                bgcolor: '#F3F8FF',
              }}>
              <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: '#DCEBFF', color: '#145FD7' }}>
                <LockOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: '#163A68', fontSize: 14, fontWeight: 800, lineHeight: 1.45 }}>{secureAccessUsed ? 'เปิดสถานะจาก QR เรียบร้อยแล้ว' : 'สแกน QR จากใบเสร็จมาใช่ไหม?'}</Typography>
                <Typography sx={{ mt: 0.35, color: '#526B8A', fontSize: 13, lineHeight: 1.6 }}>
                  {secureAccessUsed
                    ? 'สถานะของออเดอร์นี้แสดงอยู่ด้านล่าง หากต้องการเช็กออเดอร์อื่นให้กรอกข้อมูลใหม่ได้เลย'
                    : 'ระบบจะแสดงสถานะให้อัตโนมัติ หรือค้นหาเองด้วยเลขออเดอร์และเบอร์โทร 4 ตัวท้าย'}
                </Typography>
              </Box>
            </Box>

            <Stack
              spacing={2.5}
              component="form"
              onSubmit={event => {
                event.preventDefault();
                void handleSearch();
              }}>
              <Box>
                <Typography component="label" htmlFor="tracking-order-number" sx={{ display: 'block', color: '#172033', fontSize: 15, fontWeight: 800 }}>
                  เลขออเดอร์
                </Typography>
                <Typography sx={{ mt: 0.35, mb: 1, color: '#66758A', fontSize: 12.5, lineHeight: 1.5 }}>ดูได้จากใบเสร็จหรือข้อความที่ได้รับจากร้าน</Typography>
                <TextField
                  id="tracking-order-number"
                  fullWidth
                  value={orderNumber}
                  onChange={event => setOrderNumber(event.target.value)}
                  placeholder="เช่น GD-2026-000242"
                  autoComplete="off"
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptLongRoundedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { enterKeyHint: 'next' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 56,
                      borderRadius: 2.5,
                      bgcolor: '#FFFFFF',
                      '& fieldset': { borderColor: '#CBD5E1' },
                      '&:hover fieldset': { borderColor: '#7C91AD' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(20, 95, 215, 0.12)' },
                      '&.Mui-focused fieldset': { borderColor: '#145FD7', borderWidth: 1.5 },
                    },
                    '& input': { py: 1.6, fontSize: 16, fontWeight: 650 },
                  }}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="tracking-phone-suffix" sx={{ display: 'block', color: '#172033', fontSize: 15, fontWeight: 800 }}>
                  เบอร์โทร 4 ตัวท้าย
                </Typography>
                <Typography sx={{ mt: 0.35, mb: 1, color: '#66758A', fontSize: 12.5, lineHeight: 1.5 }}>ใช้เบอร์เดียวกับที่แจ้งไว้ตอนสั่งงาน</Typography>
                <TextField
                  id="tracking-phone-suffix"
                  fullWidth
                  value={phoneSuffix}
                  onChange={event => setPhoneSuffix(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  autoComplete="off"
                  inputMode="numeric"
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneRoundedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { maxLength: 4, enterKeyHint: 'search' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 56,
                      borderRadius: 2.5,
                      bgcolor: '#FFFFFF',
                      '& fieldset': { borderColor: '#CBD5E1' },
                      '&:hover fieldset': { borderColor: '#7C91AD' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(20, 95, 215, 0.12)' },
                      '&.Mui-focused fieldset': { borderColor: '#145FD7', borderWidth: 1.5 },
                    },
                    '& input': { py: 1.6, fontSize: 18, fontWeight: 800, letterSpacing: '0.18em' },
                  }}
                />
              </Box>

              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                endIcon={loading ? undefined : <ArrowForwardRoundedIcon />}
                sx={{
                  minHeight: 56,
                  borderRadius: 2.5,
                  bgcolor: '#145FD7',
                  fontSize: 16,
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 10px 24px rgba(20, 95, 215, 0.24)',
                  '&:hover': { bgcolor: '#0F4FB8', boxShadow: '0 12px 28px rgba(20, 95, 215, 0.30)' },
                }}>
                {loading ? <CircularProgress size={23} color="inherit" /> : 'ดูสถานะงาน'}
              </Button>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.75} sx={{ color: '#6B7A90' }}>
                <LockOutlinedIcon sx={{ fontSize: 15 }} />
                <Typography sx={{ fontSize: 11.5, lineHeight: 1.5, textAlign: 'center' }}>ข้อมูลนี้ใช้เพื่อตรวจสอบออเดอร์ของคุณเท่านั้น</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

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
                          <Typography sx={{ fontWeight: isCurrent ? 800 : 700, color: item.state === 'upcoming' ? 'text.secondary' : 'text.primary' }}>{copy.label}</Typography>
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
