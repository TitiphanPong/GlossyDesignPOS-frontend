'use client';

import { useMemo, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import type { ActionCenterSummary, Notification } from '@/lib/useNotifications';
import { getNotificationActionHref } from '@/lib/notification-actions';

type ActionCenterTab = 'all' | 'urgent' | 'files' | 'finance' | 'follow_up';

const TABS: ReadonlyArray<{ key: ActionCenterTab; label: string }> = [
  { key: 'all', label: 'ต้องทำ' },
  { key: 'urgent', label: 'เร่งด่วน' },
  { key: 'files', label: 'งาน / ไฟล์' },
  { key: 'finance', label: 'การเงิน' },
  { key: 'follow_up', label: 'ติดตาม' },
];

const PRIORITY = {
  critical: { accent: '#DC2626', soft: '#FEF2F2', label: 'เร่งด่วน' },
  high: { accent: '#EA580C', soft: '#FFF7ED', label: 'สำคัญ' },
  normal: { accent: '#2563EB', soft: '#EFF6FF', label: 'ปกติ' },
  low: { accent: '#64748B', soft: '#F8FAFC', label: 'ติดตาม' },
} as const;

const EMPTY_SUMMARY: ActionCenterSummary = { total: 0, critical: 0, outstandingAmount: 0, filesWaiting: 0 };
const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function relativeTime(value: string) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000));
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

function groupOf(notification: Notification): Exclude<ActionCenterTab, 'all' | 'urgent'> {
  if (notification.entityType === 'payment' || notification.type.startsWith('payment_')) return 'finance';
  if (notification.entityType === 'upload' || notification.type.startsWith('upload_')) return 'files';
  return 'follow_up';
}

function itemIcon(notification: Notification) {
  if (notification.entityType === 'payment' || notification.type.startsWith('payment_')) return <PaymentsRoundedIcon />;
  if (notification.entityType === 'upload' || notification.type.startsWith('upload_')) return <DescriptionRoundedIcon />;
  if (notification.type.includes('pickup')) return <Inventory2RoundedIcon />;
  if (notification.priority === 'critical') return <ErrorRoundedIcon />;
  return <AccessTimeRoundedIcon />;
}

function SummaryMetric({ icon, label, value, emphasis }: Readonly<{ icon: React.ReactNode; label: string; value: string; emphasis?: boolean }>) {
  return (
    <Box sx={{ minWidth: 0, flex: 1, p: 1.25, borderRadius: 2.75, border: '1px solid #E2E8F0', bgcolor: emphasis ? '#FFF7F7' : '#FFFFFF' }}>
      <Stack direction="row" alignItems="center" gap={0.7} sx={{ color: emphasis ? '#DC2626' : '#64748B' }}>
        {icon}
        <Typography noWrap fontSize={11.5} fontWeight={800}>{label}</Typography>
      </Stack>
      <Typography noWrap sx={{ mt: 0.55, color: emphasis ? '#B91C1C' : '#0F172A', fontSize: 18, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
    </Box>
  );
}

function ActionCard({ notification, onOpen }: Readonly<{ notification: Notification; onOpen: (notification: Notification) => void }>) {
  const priority = PRIORITY[notification.priority];
  const href = getNotificationActionHref(notification);
  const contextLabel = groupOf(notification) === 'finance' ? 'การเงิน' : groupOf(notification) === 'files' ? 'งาน / ไฟล์' : 'ติดตาม';

  return (
    <Box sx={{ mx: 1.5, mb: 1.1, p: 1.6, borderRadius: 3.25, border: '1px solid #E2E8F0', borderLeft: `4px solid ${priority.accent}`, bgcolor: '#FFFFFF', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.045)' }}>
      <Stack gap={1.25}>
        <Stack direction="row" gap={1.15} alignItems="flex-start">
          <Box sx={{ width: 40, height: 40, borderRadius: 2.5, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: priority.soft, color: priority.accent }}>
            {itemIcon(notification)}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.35 }}>
              <Chip label={contextLabel} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: '#F1F5F9', color: '#475569' }} />
              {notification.priority === 'critical' ? <Chip label="เร่งด่วน" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 900, bgcolor: '#FEE2E2', color: '#B91C1C' }} /> : null}
            </Stack>
            <Typography sx={{ color: '#0F172A', fontSize: 14.5, fontWeight: 900, lineHeight: 1.3 }}>{notification.title}</Typography>
            {notification.message ? <Typography sx={{ mt: 0.35, color: '#64748B', fontSize: 12.75, lineHeight: 1.45 }}>{notification.message}</Typography> : null}
          </Box>
        </Stack>

        <Box sx={{ p: 1.1, borderRadius: 2.4, bgcolor: '#F8FAFC', border: '1px solid #EEF2F7' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Box sx={{ minWidth: 0 }}>
              {notification.orderCode ? <Typography noWrap fontSize={12.5} fontWeight={900} color="#334155">#{notification.orderCode}</Typography> : null}
              {notification.customerName ? <Typography noWrap fontSize={12} color="#64748B">{notification.customerName}</Typography> : null}
              <Typography fontSize={11.5} color="#94A3B8">{relativeTime(notification.createdAt)}</Typography>
            </Box>
            {typeof notification.amount === 'number' && notification.amount > 0 ? (
              <Typography noWrap fontSize={16} fontWeight={900} color="#DC2626" sx={{ fontVariantNumeric: 'tabular-nums' }}>฿{money.format(notification.amount)}</Typography>
            ) : null}
          </Stack>
        </Box>

        {href ? (
          <Button fullWidth variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => onOpen(notification)} sx={{ minHeight: 42, borderRadius: 2.5, fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}>
            {notification.action?.label || 'เปิดรายการ'}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  summary?: ActionCenterSummary;
  isLoading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
};

export function NotificationDrawer({ open, onClose, notifications, summary = EMPTY_SUMMARY, isLoading, onNotificationClick }: Readonly<NotificationDrawerProps>) {
  const [selectedTab, setSelectedTab] = useState<ActionCenterTab>('all');

  const visible = useMemo(() => {
    const filtered = notifications.filter(notification => {
      if (selectedTab === 'all') return true;
      if (selectedTab === 'urgent') return notification.priority === 'critical';
      return groupOf(notification) === selectedTab;
    });
    const order = { critical: 0, high: 1, normal: 2, low: 3 } as const;
    return [...filtered].sort((a, b) => order[a.priority] - order[b.priority] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, selectedTab]);

  const openAction = (notification: Notification) => {
    const href = getNotificationActionHref(notification);
    onNotificationClick?.(notification);
    if (!href) return;
    onClose();
    window.location.assign(href);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 470 }, maxWidth: 470, bgcolor: '#F6F8FC', boxShadow: '-18px 0 48px rgba(15, 23, 42, 0.18)' } } }}>
      <Stack sx={{ height: '100%', minWidth: 0 }}>
        <Box sx={{ px: { xs: 2, sm: 2.4 }, pt: 2.2, pb: 1.6, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={0.8}>
                <Typography fontSize={21} fontWeight={900} color="#0F172A">ศูนย์งาน</Typography>
                <Chip label={summary.total} size="small" sx={{ height: 24, bgcolor: summary.total ? '#DBEAFE' : '#ECFDF5', color: summary.total ? '#1D4ED8' : '#047857', fontWeight: 900 }} />
              </Stack>
              <Typography sx={{ mt: 0.45, color: '#64748B', fontSize: 12.75 }}>สิ่งที่หน้าร้านต้องทำต่อ ไม่ใช่แค่รายการแจ้งเตือน</Typography>
            </Box>
            <IconButton aria-label="ปิดศูนย์งาน" onClick={onClose} sx={{ width: 38, height: 38, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}><CloseRoundedIcon /></IconButton>
          </Stack>

          <Stack direction="row" gap={0.8} sx={{ mt: 1.6 }}>
            <SummaryMetric icon={<ErrorRoundedIcon sx={{ fontSize: 16 }} />} label="เร่งด่วน" value={String(summary.critical)} emphasis={summary.critical > 0} />
            <SummaryMetric icon={<PaymentsRoundedIcon sx={{ fontSize: 16 }} />} label="ยอดค้าง" value={`฿${money.format(summary.outstandingAmount)}`} />
            <SummaryMetric icon={<DescriptionRoundedIcon sx={{ fontSize: 16 }} />} label="ไฟล์รอตรวจ" value={String(summary.filesWaiting)} />
          </Stack>
        </Box>

        <Stack direction="row" gap={0.6} sx={{ px: 1.5, py: 1.2, overflowX: 'auto', bgcolor: '#F6F8FC', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {TABS.map(tab => (
            <Button key={tab.key} size="small" variant={selectedTab === tab.key ? 'contained' : 'outlined'} onClick={() => setSelectedTab(tab.key)} sx={{ minWidth: 'max-content', minHeight: 36, px: 1.25, borderRadius: 2.25, textTransform: 'none', fontWeight: 800, boxShadow: 'none', ...(selectedTab === tab.key ? { bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } } : { bgcolor: '#FFFFFF', borderColor: '#E2E8F0', color: '#475569' }) }}>
              {tab.label}
            </Button>
          ))}
        </Stack>

        {isLoading ? (
          <Stack flex={1} alignItems="center" justifyContent="center" gap={1.2}><CircularProgress size={28} /><Typography fontSize={13} color="#64748B">กำลังตรวจสอบงาน...</Typography></Stack>
        ) : visible.length === 0 ? (
          <Stack flex={1} alignItems="center" justifyContent="center" textAlign="center" gap={1.1} sx={{ px: 4 }}>
            <Box sx={{ width: 58, height: 58, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: '#ECFDF5', color: '#059669' }}><CheckCircleRoundedIcon sx={{ fontSize: 34 }} /></Box>
            <Typography fontSize={17} fontWeight={900} color="#0F172A">ไม่มีงานในกลุ่มนี้</Typography>
            <Typography fontSize={13} color="#64748B">งานจะหายจากศูนย์งานอัตโนมัติเมื่อสถานะจริงได้รับการจัดการแล้ว</Typography>
          </Stack>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pt: 0.2, pb: 2 }}>
            {visible.map(notification => <ActionCard key={notification._id} notification={notification} onOpen={openAction} />)}
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
