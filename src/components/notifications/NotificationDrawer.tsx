'use client';

import React, { useMemo } from 'react';
import { Drawer, Stack, Typography, Box, Chip, Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export type Notification = {
  _id: string;
  type: string;
  category: 'action_required' | 'today' | 'follow_up' | 'system';
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'active' | 'resolved' | 'dismissed';
  title: string;
  message?: string;
  orderId?: string;
  orderCode?: string;
  customerName?: string;
  amount?: number;
  dueDate?: string | Date;
  action?: {
    label: string;
    href?: string;
    action?: string;
  };
  isRead: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  resolvedAt?: string | Date;
};

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  isLoading?: boolean;
  notificationCount?: {
    active: number;
    actionRequired: number;
  };
  onNotificationClick?: (notification: Notification) => void;
  onNotificationResolve?: (notificationId: string) => Promise<void>;
  onNotificationDismiss?: (notificationId: string) => Promise<void>;
};

const PRIORITY_COLORS = {
  critical: '#DC2626', // red-600
  high: '#EA580C', // orange-600
  normal: '#2563EB', // blue-600
  low: '#7C3AED', // purple-600
};

const CATEGORY_LABELS = {
  action_required: 'ต้องจัดการ',
  today: 'วันนี้',
  follow_up: 'ติดตาม',
  system: 'ระบบ',
};

function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'critical':
      return <ErrorIcon sx={{ color: PRIORITY_COLORS.critical }} />;
    case 'high':
      return <WarningAmberIcon sx={{ color: PRIORITY_COLORS.high }} />;
    case 'normal':
      return <InfoIcon sx={{ color: PRIORITY_COLORS.normal }} />;
    case 'low':
      return <CheckCircleIcon sx={{ color: PRIORITY_COLORS.low }} />;
    default:
      return <InfoIcon />;
  }
}

function NotificationCard({
  notification,
  onAction,
  onResolve,
  onDismiss,
}: Readonly<{
  notification: Notification;
  onAction?: (notification: Notification) => void;
  onResolve?: () => Promise<void>;
  onDismiss?: () => Promise<void>;
}>) {
  const [resolving, setResolving] = React.useState(false);
  const [dismissing, setDismissing] = React.useState(false);

  const handleResolve = async () => {
    try {
      setResolving(true);
      await onResolve?.();
    } finally {
      setResolving(false);
    }
  };

  const handleDismiss = async () => {
    try {
      setDismissing(true);
      await onDismiss?.();
    } finally {
      setDismissing(false);
    }
  };

  const priorityColor = PRIORITY_COLORS[notification.priority as keyof typeof PRIORITY_COLORS];

  return (
    <Box
      sx={{
        p: 1.6,
        mx: 1.5,
        mb: 1.2,
        border: '1px solid #E2E8F0',
        borderRadius: 2.5,
        bgcolor: '#FFFFFF',
        boxShadow: '0 10px 22px rgba(15, 23, 42, 0.05)',
        '&:hover': {
          borderColor: alpha(priorityColor, 0.35),
          boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
        },
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        borderLeft: `5px solid ${priorityColor}`,
        opacity: notification.status === 'resolved' ? 0.6 : 1,
      }}>
      <Stack spacing={1.5}>
        {/* Header with icon and title */}
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
          <Box sx={{ pt: 0.5, flexShrink: 0 }}>{getPriorityIcon(notification.priority)}</Box>
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 14,
                color: '#101828',
                lineHeight: 1.3,
              }}>
              {notification.title}
            </Typography>
            {notification.message && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#475467',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}>
                {notification.message}
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Context details */}
        {!!(notification.orderCode || notification.customerName || notification.amount) && (
          <Stack
            spacing={0.75}
            sx={{
              p: 1.2,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              fontSize: 13,
              color: '#475467',
            }}>
            {notification.orderCode && (
              <Box>
                <strong>#{notification.orderCode}</strong>
              </Box>
            )}
            {notification.customerName && <Box sx={{ fontSize: 12.5 }}>{notification.customerName}</Box>}
            {!!notification.amount && <Box sx={{ fontSize: 12.5, fontWeight: 600, color: '#DC2626' }}>฿{notification.amount.toLocaleString('th-TH')}</Box>}
          </Stack>
        )}

        {/* Category badge */}
        <Chip
          label={CATEGORY_LABELS[notification.category as keyof typeof CATEGORY_LABELS]}
          size="small"
          sx={{
            height: 24,
            fontSize: 12,
            fontWeight: 500,
            width: 'fit-content',
            bgcolor: alpha(priorityColor, 0.1),
            color: priorityColor,
          }}
        />

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
          {notification.action && (
            <Button
              size="small"
              variant="contained"
              sx={{
                bgcolor: '#2563EB',
                color: 'white',
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
              onClick={() => onAction?.(notification)}>
              {notification.action.label}
            </Button>
          )}

          {notification.status === 'active' && (
            <>
              <Tooltip title="เสร็จสิ้น">
                <IconButton
                  size="small"
                  disabled={resolving}
                  onClick={handleResolve}
                  sx={{
                    color: '#64748B',
                    '&:hover': { bgcolor: alpha('#64748B', 0.1) },
                  }}>
                  {resolving ? <CircularProgress size={18} /> : <CheckCircleIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="ปิด">
                <IconButton
                  size="small"
                  disabled={dismissing}
                  onClick={handleDismiss}
                  sx={{
                    color: '#94A3B8',
                    '&:hover': { bgcolor: alpha('#94A3B8', 0.1) },
                  }}>
                  {dismissing ? <CircularProgress size={18} /> : <CloseIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export function NotificationDrawer({
  open,
  onClose,
  notifications,
  isLoading,
  notificationCount,
  onNotificationClick,
  onNotificationResolve,
  onNotificationDismiss,
}: Readonly<NotificationDrawerProps>) {
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'action_required' | 'today'>('action_required');

  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') return notifications;
    return notifications.filter(n => n.category === selectedCategory);
  }, [notifications, selectedCategory]);

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      // Active before resolved
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }
      // By priority
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      // By date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredNotifications]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 450 },
            maxWidth: 450,
            bgcolor: '#F6F8FC',
            boxShadow: '-18px 0 44px rgba(15, 23, 42, 0.16)',
          },
        },
      }}>
      <Stack sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} spacing={0}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ px: 2.5, pt: 2.6, pb: 2.2, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <Stack spacing={0.85}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontWeight: 850, fontSize: 20, color: '#0F172A', lineHeight: 1.1 }}>งานที่ต้องจัดการ</Typography>
              <Box sx={{ px: 1, py: 0.25, borderRadius: '999px', bgcolor: '#EEF2FF', color: '#2563EB', fontSize: 12, fontWeight: 800 }}>{notificationCount?.actionRequired ?? 0}</Box>
            </Stack>
            <Typography sx={{ fontSize: 13, color: '#64748B' }}>ติดตามงานเร่งด่วนและการแจ้งเตือนหน้าร้าน</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748B', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#F8FAFC' } }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Category tabs */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            m: 1.5,
            p: 0.5,
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
            bgcolor: '#FFFFFF',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 },
          }}>
          {[
            { key: 'action_required', label: 'ต้องจัดการ' },
            { key: 'today', label: 'วันนี้' },
            { key: 'all', label: 'ทั้งหมด' },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={selectedCategory === tab.key ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedCategory(tab.key as any)}
              sx={{
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 750,
                px: 1.6,
                py: 0.75,
                borderRadius: 2,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                ...(selectedCategory === tab.key
                  ? {
                      bgcolor: '#0F172A',
                      color: 'white',
                      borderColor: '#0F172A',
                    }
                  : {
                      borderColor: 'transparent',
                      color: '#475569',
                      bgcolor: 'transparent',
                    }),
              }}>
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* Content */}
        <RenderNotificationContent
          isLoading={isLoading}
          sortedNotifications={sortedNotifications}
          onNotificationClick={onNotificationClick}
          onNotificationResolve={onNotificationResolve}
          onNotificationDismiss={onNotificationDismiss}
        />
      </Stack>
    </Drawer>
  );
}

function RenderNotificationContent({
  isLoading,
  sortedNotifications,
  onNotificationClick,
  onNotificationResolve,
  onNotificationDismiss,
}: Readonly<{
  isLoading?: boolean;
  sortedNotifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onNotificationResolve?: (notificationId: string) => Promise<void>;
  onNotificationDismiss?: (notificationId: string) => Promise<void>;
}>) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.4} sx={{ flex: 1, mx: 1.5, my: 2, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FFFFFF' }}>
        <CircularProgress size={28} sx={{ color: '#0F172A' }} />
        <Typography sx={{ fontSize: 13, color: '#64748B' }}>กำลังโหลดรายการ...</Typography>
      </Stack>
    );
  }

  const isEmpty = sortedNotifications.length === 0;

  if (isEmpty) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.4} sx={{ flex: 1, mx: 1.5, my: 2, px: 3, textAlign: 'center', border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FFFFFF' }}>
        <Box sx={{ width: 54, height: 54, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: '#ECFDF5', color: '#059669' }}>
          <CheckCircleIcon sx={{ fontSize: 34 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A' }}>เรียบร้อยทั้งหมด</Typography>
        <Typography sx={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.45 }}>ตอนนี้ไม่มีงานที่ต้องจัดการ</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ flex: 1, overflow: 'auto', minWidth: 0, pt: 0.2, pb: 1.5 }}>
      {sortedNotifications.map(notification => (
        <NotificationCard
          key={notification._id}
          notification={notification}
          onAction={n => {
            if (n.action?.href) {
              window.location.href = n.action.href;
            }
            onNotificationClick?.(n);
          }}
          onResolve={async () => {
            await onNotificationResolve?.(notification._id);
          }}
          onDismiss={async () => {
            await onNotificationDismiss?.(notification._id);
          }}
        />
      ))}
    </Stack>
  );
}
