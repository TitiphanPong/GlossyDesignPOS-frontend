'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNotifications } from '@/lib/useNotifications';
import { actionCenterHref, DEFAULT_FILTERS, selectActionCenterItems } from '@/lib/action-center-view';
import { ActionCenterFeedback, ActionCenterFiltersBar, ActionCenterRow, ActionCenterSummaryCards, touchSx } from './ActionCenterShared';

export function NotificationDrawer() {
  const { drawerOpen, closeDrawer, notifications, lastSuccessfulAt } = useNotifications();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const restoreFocus = useRef(true);
  const close = () => {
    restoreFocus.current = true;
    closeDrawer();
  };
  const navigate = () => {
    restoreFocus.current = false;
    closeDrawer();
  };
  const visible = selectActionCenterItems(notifications, filters);
  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={close}
      slotProps={{
        paper: { role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'action-center-drawer-title', sx: { width: { xs: '100%', sm: 480 }, maxWidth: '100%' } },
        transition: {
          onExited: () => {
            // The original trigger can unmount at a responsive breakpoint.
            if (restoreFocus.current) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-action-center-trigger]')?.focus());
          },
        },
      }}>
      <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 }, minHeight: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography id="action-center-drawer-title" component="h2" variant="h5" fontWeight={700}>
              ศูนย์งาน
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รับทราบเป็นสถานะส่วนตัว งานจบจากข้อมูลต้นทาง
            </Typography>
          </Box>
          <IconButton aria-label="ปิดศูนย์งาน" onClick={close} sx={touchSx}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <ActionCenterSummaryCards />
        <ActionCenterFiltersBar filters={filters} onChange={setFilters} />
        <ActionCenterFeedback />
        {lastSuccessfulAt && <Typography variant="body2">พบ {visible.length} รายการตามตัวกรอง</Typography>}
        {visible.slice(0, 10).map(item => (
          <ActionCenterRow key={item._id} item={item} onNavigate={navigate} />
        ))}
        {lastSuccessfulAt && !visible.length && <Typography role="status">ไม่มีงานตามตัวกรองนี้</Typography>}
        {visible.length > 10 && <Typography>ยังมีอีก {visible.length - 10} รายการ</Typography>}
        <Button component={Link} href={actionCenterHref({ ...filters, page: 1 })} onClick={navigate} variant="contained" sx={touchSx}>
          เปิดศูนย์งานทั้งหมด
        </Button>
      </Stack>
    </Drawer>
  );
}
