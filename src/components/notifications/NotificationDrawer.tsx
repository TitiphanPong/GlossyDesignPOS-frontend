'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SnoozeRoundedIcon from '@mui/icons-material/SnoozeRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import type { ActionCenterSummary, Notification } from '@/lib/useNotifications';
import { getNotificationActionHref } from '@/lib/notification-actions';
import {
  actionCenterGroup,
  buildActionCenterRows,
  type ActionCenterDisplayRow,
  type ActionCenterTab,
} from '@/lib/action-center-view';

const TABS: ReadonlyArray<{ key: ActionCenterTab; label: string }> = [
  { key: 'attention', label: 'ต้องทำ' },
  { key: 'urgent', label: 'เร่งด่วน' },
  { key: 'files', label: 'งาน / ไฟล์' },
  { key: 'finance', label: 'การเงิน' },
  { key: 'follow_up', label: 'ติดตาม' },
  { key: 'acknowledged', label: 'รับทราบแล้ว' },
];

const PRIORITY = {
  critical: { accent: '#DC2626', soft: '#FEF2F2' },
  high: { accent: '#EA580C', soft: '#FFF7ED' },
  normal: { accent: '#2563EB', soft: '#EFF6FF' },
  low: { accent: '#64748B', soft: '#F8FAFC' },
} as const;

const EMPTY_SUMMARY: ActionCenterSummary = {
  total: 0,
  attention: 0,
  acknowledged: 0,
  snoozed: 0,
  critical: 0,
  outstandingAmount: 0,
  filesWaiting: 0,
};
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

function snoozeTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function itemIcon(notification: Notification) {
  if (notification.entityType === 'payment' || notification.type.startsWith('payment_')) return <PaymentsRoundedIcon />;
  if (notification.entityType === 'upload' || notification.type.startsWith('upload_')) return <DescriptionRoundedIcon />;
  if (notification.entityType === 'stock' || notification.type === 'low_stock' || notification.type.includes('pickup')) return <Inventory2RoundedIcon />;
  if (notification.priority === 'critical') return <ErrorRoundedIcon />;
  return <AccessTimeRoundedIcon />;
}

function contextLabel(notification: Notification) {
  if (notification.entityType === 'stock' || notification.type === 'low_stock') return 'สต็อก';
  const group = actionCenterGroup(notification);
  if (group === 'finance') return 'การเงิน';
  if (group === 'files') return 'งาน / ไฟล์';
  return 'ติดตาม';
}

function SummaryMetric({ icon, label, value, emphasis }: Readonly<{ icon: React.ReactNode; label: string; value: string; emphasis?: boolean }>) {
  return (
    <Box sx={{ minWidth: 0, flex: 1, px: 1, py: 0.85, borderRadius: 2.25, border: '1px solid #E2E8F0', bgcolor: emphasis ? '#FFF7F7' : '#FFFFFF' }}>
      <Stack direction="row" alignItems="center" gap={0.55} sx={{ color: emphasis ? '#DC2626' : '#64748B' }}>
        {icon}
        <Typography noWrap fontSize={10.5} fontWeight={800}>{label}</Typography>
      </Stack>
      <Typography noWrap sx={{ mt: 0.25, color: emphasis ? '#B91C1C' : '#0F172A', fontSize: 16, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
    </Box>
  );
}

type CompactActionRowProps = {
  row: ActionCenterDisplayRow;
  busy: boolean;
  onOpen: (row: ActionCenterDisplayRow) => void;
  onAcknowledge: (ids: string[]) => Promise<void>;
  onSnooze: (ids: string[]) => Promise<void>;
  onUnacknowledge: (ids: string[]) => Promise<void>;
};

function CompactActionRow({ row, busy, onOpen, onAcknowledge, onSnooze, onUnacknowledge }: Readonly<CompactActionRowProps>) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const notification = row.kind === 'item' ? row.notification : null;
  const priority = PRIORITY[row.kind === 'item' ? row.notification.priority : row.priority];
  const state = row.kind === 'item' ? row.notification.attentionState ?? 'new' : row.attentionState;
  const title = row.kind === 'upload_group' ? `ไฟล์รอตรวจ ${row.count} รายการ` : row.notification.title;
  const message = row.kind === 'upload_group' ? 'รวมไฟล์ใหม่ที่ยังต้องตรวจสอบไว้ในรายการเดียว' : row.notification.message;
  const time = row.kind === 'upload_group' ? row.latestAt : row.notification.createdAt;
  const primaryLabel = row.kind === 'upload_group' ? 'เปิดคลังไฟล์' : row.notification.action?.label || 'เปิดรายการ';
  const snoozedUntil = row.kind === 'item' ? row.notification.snoozedUntil : undefined;

  const runAndClose = async (action: () => Promise<void>) => {
    setMenuAnchor(null);
    await action();
  };

  return (
    <Box
      sx={{
        mx: 1.25,
        mb: 0.75,
        px: 1.15,
        py: 1,
        borderRadius: 2.6,
        border: '1px solid #E2E8F0',
        borderLeft: `3px solid ${priority.accent}`,
        bgcolor: state === 'new' ? '#FFFFFF' : '#FAFCFF',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.035)',
      }}>
      <Stack direction="row" gap={1} alignItems="flex-start">
        <Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: priority.soft, color: priority.accent, '& svg': { fontSize: 19 } }}>
          {row.kind === 'upload_group' ? <DescriptionRoundedIcon /> : itemIcon(row.notification)}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={0.6} flexWrap="wrap">
            <Typography sx={{ color: '#0F172A', fontSize: 13.75, fontWeight: 900, lineHeight: 1.3 }}>{title}</Typography>
            {row.kind === 'upload_group' ? (
              <Chip label="งาน / ไฟล์" size="small" sx={{ height: 19, fontSize: 10, fontWeight: 800, bgcolor: '#F1F5F9', color: '#475569' }} />
            ) : (
              <Chip label={contextLabel(row.notification)} size="small" sx={{ height: 19, fontSize: 10, fontWeight: 800, bgcolor: '#F1F5F9', color: '#475569' }} />
            )}
            {state === 'acknowledged' ? <Chip label="รับทราบแล้ว" size="small" sx={{ height: 19, fontSize: 10, fontWeight: 800, bgcolor: '#ECFDF5', color: '#047857' }} /> : null}
            {state === 'snoozed' ? <Chip label={snoozedUntil ? `ซ่อนถึง ${snoozeTime(snoozedUntil)}` : 'ซ่อนชั่วคราว'} size="small" sx={{ height: 19, fontSize: 10, fontWeight: 800, bgcolor: '#F1F5F9', color: '#475569' }} /> : null}
          </Stack>
          {message ? <Typography noWrap sx={{ mt: 0.25, color: '#64748B', fontSize: 11.75 }}>{message}</Typography> : null}
          <Stack direction="row" alignItems="center" gap={0.7} sx={{ mt: 0.45, color: '#94A3B8' }}>
            {notification?.orderCode ? <Typography noWrap fontSize={10.75} fontWeight={800}>#{notification.orderCode}</Typography> : null}
            <Typography noWrap fontSize={10.75}>{relativeTime(time)}</Typography>
            {typeof notification?.amount === 'number' && notification.amount > 0 ? (
              <Typography noWrap fontSize={11.5} fontWeight={900} color="#DC2626">฿{money.format(notification.amount)}</Typography>
            ) : null}
          </Stack>
        </Box>

        <IconButton aria-label={`จัดการ ${title}`} size="small" disabled={busy} onClick={event => setMenuAnchor(event.currentTarget)} sx={{ mt: -0.25, color: '#64748B' }}>
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: 0.55 }}>
        <Button size="small" endIcon={<ArrowForwardRoundedIcon />} disabled={busy} onClick={() => onOpen(row)} sx={{ minHeight: 28, px: 0.75, textTransform: 'none', fontSize: 11.75, fontWeight: 900 }}>
          {primaryLabel}
        </Button>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} slotProps={{ paper: { sx: { minWidth: 210, borderRadius: 2.5 } } }}>
        {state === 'new' ? (
          <MenuItem disabled={busy} onClick={() => void runAndClose(() => onAcknowledge(row.notificationIds))}>
            <DoneRoundedIcon fontSize="small" sx={{ mr: 1 }} /> รับทราบแล้ว
          </MenuItem>
        ) : (
          <MenuItem disabled={busy} onClick={() => void runAndClose(() => onUnacknowledge(row.notificationIds))}>
            <UndoRoundedIcon fontSize="small" sx={{ mr: 1 }} /> นำกลับมาต้องทำ
          </MenuItem>
        )}
        <MenuItem disabled={busy} onClick={() => void runAndClose(() => onSnooze(row.notificationIds))}>
          <SnoozeRoundedIcon fontSize="small" sx={{ mr: 1 }} /> ซ่อน 1 ชั่วโมง
        </MenuItem>
      </Menu>
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
  onAcknowledge: (notificationIds: string[]) => Promise<void>;
  onSnooze: (notificationIds: string[], minutes?: number) => Promise<void>;
  onUnacknowledge: (notificationIds: string[]) => Promise<void>;
};

export function NotificationDrawer({
  open,
  onClose,
  notifications,
  summary = EMPTY_SUMMARY,
  isLoading,
  onNotificationClick,
  onAcknowledge,
  onSnooze,
  onUnacknowledge,
}: Readonly<NotificationDrawerProps>) {
  const [selectedTab, setSelectedTab] = useState<ActionCenterTab>('attention');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const visible = useMemo(() => buildActionCenterRows(notifications, selectedTab), [notifications, selectedTab]);

  const openAction = (row: ActionCenterDisplayRow) => {
    if (row.kind === 'upload_group') {
      onClose();
      window.location.assign('/home/storage');
      return;
    }
    const href = getNotificationActionHref(row.notification);
    onNotificationClick?.(row.notification);
    if (!href) return;
    onClose();
    window.location.assign(href);
  };

  const runMutation = async (row: ActionCenterDisplayRow, action: () => Promise<void>) => {
    setBusyKey(row.key);
    setMutationError(null);
    try {
      await action();
    } catch (error) {
      console.error('Failed to update Action Center state:', error);
      setMutationError('อัปเดตศูนย์งานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 450 }, maxWidth: 450, bgcolor: '#F6F8FC', boxShadow: '-18px 0 48px rgba(15, 23, 42, 0.18)' } } }}>
      <Stack sx={{ height: '100%', minWidth: 0 }}>
        <Box sx={{ px: { xs: 1.6, sm: 2 }, pt: 1.6, pb: 1.15, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.2}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={0.7}>
                <Typography fontSize={19} fontWeight={900} color="#0F172A">ศูนย์งาน</Typography>
                <Chip label={summary.attention} size="small" sx={{ height: 22, bgcolor: summary.attention ? '#DBEAFE' : '#ECFDF5', color: summary.attention ? '#1D4ED8' : '#047857', fontWeight: 900 }} />
              </Stack>
              <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 11.5 }}>
                ค้างจริง {summary.total} • รับทราบ {summary.acknowledged} • ซ่อนชั่วคราว {summary.snoozed}
              </Typography>
            </Box>
            <IconButton aria-label="ปิดศูนย์งาน" onClick={onClose} sx={{ width: 34, height: 34, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}><CloseRoundedIcon fontSize="small" /></IconButton>
          </Stack>

          <Stack direction="row" gap={0.65} sx={{ mt: 1.1 }}>
            <SummaryMetric icon={<ErrorRoundedIcon sx={{ fontSize: 14 }} />} label="เร่งด่วน" value={String(summary.critical)} emphasis={summary.critical > 0} />
            <SummaryMetric icon={<PaymentsRoundedIcon sx={{ fontSize: 14 }} />} label="ยอดค้าง" value={`฿${money.format(summary.outstandingAmount)}`} />
            <SummaryMetric icon={<DescriptionRoundedIcon sx={{ fontSize: 14 }} />} label="ไฟล์รอตรวจ" value={String(summary.filesWaiting)} />
          </Stack>
        </Box>

        <Stack direction="row" gap={0.5} sx={{ px: 1.25, py: 0.9, overflowX: 'auto', bgcolor: '#F6F8FC', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {TABS.map(tab => (
            <Button key={tab.key} size="small" variant={selectedTab === tab.key ? 'contained' : 'outlined'} onClick={() => setSelectedTab(tab.key)} sx={{ minWidth: 'max-content', minHeight: 32, px: 1.05, borderRadius: 2, textTransform: 'none', fontSize: 11.75, fontWeight: 800, boxShadow: 'none', ...(selectedTab === tab.key ? { bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } } : { bgcolor: '#FFFFFF', borderColor: '#E2E8F0', color: '#475569' }) }}>
              {tab.label}
            </Button>
          ))}
        </Stack>

        {mutationError ? <Alert severity="error" sx={{ mx: 1.25, mb: 0.75, borderRadius: 2.5, py: 0 }}>{mutationError}</Alert> : null}

        {isLoading ? (
          <Stack flex={1} alignItems="center" justifyContent="center" gap={1}><CircularProgress size={26} /><Typography fontSize={12.5} color="#64748B">กำลังตรวจสอบงาน...</Typography></Stack>
        ) : visible.length === 0 ? (
          <Stack flex={1} alignItems="center" justifyContent="center" textAlign="center" gap={0.8} sx={{ px: 4 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2.75, display: 'grid', placeItems: 'center', bgcolor: '#ECFDF5', color: '#059669' }}><CheckCircleRoundedIcon sx={{ fontSize: 30 }} /></Box>
            <Typography fontSize={15.5} fontWeight={900} color="#0F172A">ไม่มีงานในกลุ่มนี้</Typography>
            <Typography fontSize={12} color="#64748B">รายการที่รับทราบหรือซ่อนยังไม่ถูกลบ งานจริงจะหายเมื่อสถานะต้นทางได้รับการจัดการ</Typography>
          </Stack>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pt: 0.15, pb: 1.5 }}>
            {visible.map(row => (
              <CompactActionRow
                key={row.key}
                row={row}
                busy={busyKey === row.key}
                onOpen={openAction}
                onAcknowledge={ids => runMutation(row, () => onAcknowledge(ids))}
                onSnooze={ids => runMutation(row, () => onSnooze(ids, 60))}
                onUnacknowledge={ids => runMutation(row, () => onUnacknowledge(ids))}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
