'use client';

import * as React from 'react';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import AdminHeroHeader, {
  formatAdminLastSynced,
  formatAdminThaiDate,
  heroOutlineButtonSx,
} from '../components/AdminHeroHeader';
import AdminPageContainer from '../components/AdminPageContainer';
import { fetchApiJson } from '@/lib/api';
import {
  mapSystemHealthState,
  parseReadinessDetails,
  type ReadinessDetails,
  type SystemHealthState,
} from '@/lib/system-health';

const POLL_INTERVAL_MS = 60_000;

const statePresentation: Record<
  SystemHealthState,
  { label: string; description: string; color: 'success' | 'warning' | 'error' }
> = {
  healthy: {
    label: 'ระบบพร้อมใช้งาน',
    description: 'Frontend ติดต่อ Backend ได้ และ dependency ที่จำเป็นพร้อมใช้งาน',
    color: 'success',
  },
  degraded: {
    label: 'ระบบมีบางส่วนไม่พร้อม',
    description: 'Backend ยังตอบสนอง แต่มี dependency บางรายการไม่พร้อมใช้งาน',
    color: 'warning',
  },
  unready: {
    label: 'Backend ยังไม่พร้อม',
    description: 'Backend ตอบสนองได้ แต่ dependency ที่จำเป็นยังไม่พร้อมใช้งาน',
    color: 'error',
  },
  unreachable: {
    label: 'ติดต่อ Backend ไม่ได้',
    description: 'Frontend ไม่สามารถอ่านผล readiness จาก Backend ได้ในขณะนี้',
    color: 'error',
  },
};

function formatCheckedAt(value: string | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

export default function SystemHealthPage() {
  const [details, setDetails] = React.useState<ReadinessDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastCheckedAt, setLastCheckedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inFlightRef = React.useRef<Promise<void> | null>(null);

  const load = React.useCallback(() => {
    if (inFlightRef.current) return inFlightRef.current;

    const request = (async () => {
      setLoading(true);
      try {
        const payload = await fetchApiJson<unknown>('/health/ready/details', {
          cache: 'no-store',
        });
        const parsed = parseReadinessDetails(payload);
        if (!parsed) throw new Error('Backend returned an invalid readiness response');
        setDetails(parsed);
        setError(null);
      } catch (loadError) {
        setDetails(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'ไม่สามารถตรวจสอบสถานะระบบได้',
        );
      } finally {
        setLastCheckedAt(new Date());
        setLoading(false);
      }
    })().finally(() => {
      if (inFlightRef.current === request) inFlightRef.current = null;
    });

    inFlightRef.current = request;
    return request;
  }, []);

  React.useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
    };

    const schedule = () => {
      clearTimer();
      if (stopped || document.visibilityState === 'hidden') return;
      timer = setTimeout(() => {
        timer = null;
        void load().finally(schedule);
      }, POLL_INTERVAL_MS);
    };

    const refresh = () => {
      clearTimer();
      if (document.visibilityState === 'hidden') return;
      void load().finally(schedule);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') clearTimer();
      else refresh();
    };

    document.addEventListener('visibilitychange', onVisibility);
    void load().finally(schedule);

    return () => {
      stopped = true;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  const state = mapSystemHealthState(details);
  const presentation = statePresentation[state];
  const dependencies = [
    {
      key: 'database',
      label: 'ฐานข้อมูล',
      icon: DataObjectRoundedIcon,
      status: details?.dependencies.database,
    },
    {
      key: 'objectStorage',
      label: 'พื้นที่เก็บไฟล์',
      icon: CloudQueueRoundedIcon,
      status: details?.dependencies.objectStorage,
    },
  ];

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="System Health"
        description="ตรวจสอบการเชื่อมต่อ Frontend → Backend และ dependency ที่จำเป็น โดยไม่แสดงค่าเชื่อมต่อหรือข้อมูลลับ"
        lastSynced={formatAdminLastSynced(lastCheckedAt)}
        thaiDate={formatAdminThaiDate(lastCheckedAt)}
        actions={
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
            onClick={() => void load()}
            disabled={loading}
            sx={heroOutlineButtonSx}>
            {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบอีกครั้ง'}
          </Button>
        }
      />

      <Stack spacing={2.5}>
        <Alert severity={presentation.color} icon={<HealthAndSafetyRoundedIcon />}>
          <Typography fontWeight={800}>{presentation.label}</Typography>
          <Typography variant="body2">{presentation.description}</Typography>
        </Alert>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}>
          {dependencies.map(item => (
            <Card
              key={item.key}
              variant="outlined"
              sx={{ borderRadius: 4, borderColor: '#E5E7EB' }}>
              <CardContent sx={{ p: '22px !important' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        bgcolor: '#F1F5F9',
                        display: 'grid',
                        placeItems: 'center',
                      }}>
                      <item.icon sx={{ color: '#334155' }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={800}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ตรวจล่าสุด {formatCheckedAt(details?.checkedAt)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={item.status === 'ready' ? 'พร้อมใช้งาน' : item.status === 'unready' ? 'ไม่พร้อม' : 'ไม่ทราบสถานะ'}
                    color={item.status === 'ready' ? 'success' : 'error'}
                    variant={item.status ? 'filled' : 'outlined'}
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {error ? (
          <Typography variant="body2" color="text.secondary">
            รายละเอียดการตรวจสอบล่าสุด: {error}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          หน้านี้ตรวจสอบอัตโนมัติทุก 60 วินาทีเฉพาะขณะที่แท็บเปิดใช้งาน และสามารถรีเฟรชด้วยตนเองได้
        </Typography>
      </Stack>
    </AdminPageContainer>
  );
}
