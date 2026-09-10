'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Checkbox, Chip, IconButton, Menu, MenuItem, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { actionCenterGroup, domainLabels, priorityLabels, stateLabels, type ActionCenterFilters } from '@/lib/action-center-view';
import { getNotificationActionHref } from '@/lib/notification-actions';
import { useNotifications, type Notification, type PersonalAction } from '@/lib/useNotifications';
import { adminSurface } from '@/app/home/components/adminUi';

export const touchSx = { minHeight: 44, minWidth: 44 };
const money = (value: number) => value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
const date = (value: string) => new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

export function ActionCenterSummaryCards() {
  const { summary, lastSuccessfulAt } = useNotifications();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
      {[
        ['ค้างทั้งหมด', summary.total],
        ['งานวิกฤต', summary.critical],
        ['ยอดเงินค้าง', money(summary.outstandingAmount)],
        ['รายการไฟล์รอตรวจ', summary.filesWaiting],
      ].map(([label, value]) => (
        <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: adminSurface.cardRadius }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, overflowWrap: 'anywhere' }}>{lastSuccessfulAt ? value : '—'}</Typography>
        </Paper>
      ))}
    </Box>
  );
}

export function ActionCenterFiltersBar({ filters, onChange }: { filters: ActionCenterFilters; onChange: (filters: ActionCenterFilters) => void }) {
  const id = useId();
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
        {(
          [
            ['state', 'สถานะส่วนตัว', stateLabels],
            ['domain', 'ประเภทงาน', domainLabels],
            ['priority', 'ความสำคัญ', priorityLabels],
          ] as const
        ).map(([key, label, labels]) => (
          <TextField key={key} id={id + key} select fullWidth label={label} value={filters[key]} onChange={event => onChange({ ...filters, [key]: event.target.value, page: 1 })}>
            {Object.entries(labels).map(([value, text]) => (
              <MenuItem key={value} value={value} sx={touchSx}>
                {text}
              </MenuItem>
            ))}
          </TextField>
        ))}
      </Box>
      <TextField id={id + 'search'} fullWidth label="ค้นหางาน เลขงาน หรือลูกค้า" value={filters.q} onChange={event => onChange({ ...filters, q: event.target.value, page: 1 })} />
    </Stack>
  );
}

export function ActionCenterFeedback() {
  const { isLoading, error, mutationErrors, lastSuccessfulAt, refetch, notifications } = useNotifications();
  return (
    <Stack spacing={1} aria-live="polite">
      {error && (
        <Alert
          severity={lastSuccessfulAt ? 'warning' : 'error'}
          action={
            <Button sx={touchSx} color="inherit" onClick={() => void refetch()}>
              ลองใหม่
            </Button>
          }>
          {lastSuccessfulAt ? 'อัปเดตไม่สำเร็จ กำลังแสดงข้อมูลล่าสุดที่โหลดได้' : 'โหลดศูนย์งานไม่สำเร็จ'}: {error}
        </Alert>
      )}
      {[...mutationErrors].map(([id, message]) => (
        <Alert key={id} severity="error">
          บันทึกสถานะไม่สำเร็จ — {notifications.find(item => item._id === id)?.title ?? id}: {message}
        </Alert>
      ))}
      {lastSuccessfulAt && (
        <Typography variant="body2" color="text.secondary">
          อัปเดตสำเร็จล่าสุด {date(lastSuccessfulAt.toISOString())}
        </Typography>
      )}
      {isLoading && (
        <Box role="status" aria-label="กำลังโหลดศูนย์งาน">
          {[1, 2, 3].map(key => (
            <Skeleton key={key} variant="rounded" height={112} sx={{ mb: 1.5 }} />
          ))}
        </Box>
      )}
    </Stack>
  );
}

export function ActionCenterRow({ item, selected, onSelect, onNavigate }: { item: Notification; selected?: boolean; onSelect?: (checked: boolean) => void; onNavigate?: () => void }) {
  const { pendingIds, updateState } = useNotifications();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const pending = pendingIds.has(item._id);
  const href = getNotificationActionHref(item);
  const mutate = (action: PersonalAction) => {
    setAnchor(null);
    void updateState([item._id], action);
  };
  return (
    <Paper component="article" aria-label={item.title} variant="outlined" sx={{ p: 2, borderRadius: adminSurface.cardRadius, minWidth: 0, overflowWrap: 'anywhere' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        {onSelect && <Checkbox checked={selected ?? false} disabled={pending} onChange={(_, checked) => onSelect(checked)} inputProps={{ 'aria-label': 'เลือก ' + item.title }} sx={touchSx} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mb: 1 }}>
            <Chip size="small" label={domainLabels[actionCenterGroup(item)]} />
            <Chip size="small" label={priorityLabels[item.priority]} color={item.priority === 'critical' ? 'error' : item.priority === 'high' ? 'warning' : 'default'} />
            <Chip size="small" variant="outlined" label={stateLabels[item.attentionState ?? 'new']} />
          </Stack>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700 }}>
            {item.title}
          </Typography>
          {item.message && (
            <Typography sx={{ fontSize: 14, mt: 0.5 }} color="text.secondary">
              {item.message}
            </Typography>
          )}
          {(item.orderCode || item.customerName) && <Typography sx={{ fontSize: 14, mt: 1 }}>{[item.orderCode, item.customerName].filter(Boolean).join(' · ')}</Typography>}
          {item.amount !== undefined && <Typography sx={{ fontWeight: 700, mt: 1 }}>ยอดค้าง {money(item.amount)}</Typography>}
          {item.dueDate && <Typography variant="body2">กำหนดส่ง {date(item.dueDate)}</Typography>}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            สร้างเมื่อ {date(item.createdAt)}
          </Typography>
          {href && (
            <Button component={Link} href={href} onClick={onNavigate} variant="outlined" sx={{ ...touchSx, mt: 1.5 }}>
              {item.action?.label || 'เปิดรายการ'}
            </Button>
          )}
        </Box>
        <IconButton
          aria-label={'จัดการสถานะ ' + item.title}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          aria-controls={anchor ? menuId : undefined}
          disabled={pending}
          onClick={event => setAnchor(event.currentTarget)}
          sx={touchSx}>
          <MoreVertRoundedIcon />
        </IconButton>
        <Menu id={menuId} anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem sx={touchSx} disabled={pending || item.attentionState === 'acknowledged'} onClick={() => mutate('acknowledge')}>
            รับทราบ
          </MenuItem>
          <MenuItem sx={touchSx} disabled={pending} onClick={() => mutate('snooze')}>
            พักเตือน 1 ชั่วโมง
          </MenuItem>
          <MenuItem sx={touchSx} disabled={pending || (item.attentionState ?? 'new') === 'new'} onClick={() => mutate('unacknowledge')}>
            นำกลับเป็นรายการใหม่
          </MenuItem>
        </Menu>
      </Stack>
    </Paper>
  );
}
