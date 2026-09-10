'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Checkbox, Pagination, Stack, Typography } from '@mui/material';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader from '../components/AdminHeroHeader';
import { ActionCenterFeedback, ActionCenterFiltersBar, ActionCenterRow, ActionCenterSummaryCards, touchSx } from '@/components/notifications/ActionCenterShared';
import { actionCenterHref, actionCenterPage, readActionCenterFilters, selectActionCenterItems, type ActionCenterFilters } from '@/lib/action-center-view';
import { useNotifications, type PersonalAction } from '@/lib/useNotifications';

function ActionCenterPageContent() {
  const params = useSearchParams();
  const filters = readActionCenterFilters(params);
  const store = useNotifications();
  const { refetch } = store;
  const [selection, setSelection] = useState<{ scope: string; ids: string[] }>({ scope: '', ids: [] });
  const matching = selectActionCenterItems(store.notifications, filters);
  const page = actionCenterPage(matching, filters.page);
  const scope = actionCenterHref(filters);
  const selected = selection.scope === scope ? selection.ids.filter(id => page.items.some(item => item._id === id)) : [];
  const busy = selected.some(id => store.pendingIds.has(id));
  // This is a client-filtered snapshot. Native history updates the Next router
  // without starting an asynchronous server navigation for each keystroke.
  const changeFilters = (next: ActionCenterFilters) => window.history.pushState(null, '', actionCenterHref(next));
  useEffect(() => {
    void refetch();
  }, [refetch]);
  useEffect(() => {
    if (store.lastSuccessfulAt && page.page !== filters.page) window.history.replaceState(null, '', actionCenterHref({ ...readActionCenterFilters(params), page: page.page }));
  }, [store.lastSuccessfulAt, page.page, filters.page, params]);
  const mutateSelected = async (action: PersonalAction) => {
    await store.updateState(selected, action);
    setSelection({ scope, ids: [] });
  };
  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="ศูนย์งาน"
        description="งานค้างที่ต้องจัดการ · รับทราบและพักเตือนเป็นสถานะส่วนตัว งานจบจากข้อมูลต้นทางเท่านั้น"
        lastSyncedAt={store.lastSuccessfulAt}
        utilityActions={
          <Button sx={touchSx} onClick={() => void refetch()}>
            อัปเดตข้อมูล
          </Button>
        }
      />
      <Stack spacing={2.5}>
        <ActionCenterSummaryCards />
        <ActionCenterFiltersBar filters={filters} onChange={changeFilters} />
        <ActionCenterFeedback />
        {store.lastSuccessfulAt && (
          <>
            <Typography>
              พบ {matching.length} จากงานค้างทั้งหมด {store.summary.total} รายการ · หน้าละ 25 รายการ
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Checkbox
                sx={touchSx}
                inputProps={{ 'aria-label': 'เลือกรายการทั้งหมดในหน้านี้' }}
                checked={page.items.length > 0 && selected.length === page.items.length}
                indeterminate={selected.length > 0 && selected.length < page.items.length}
                disabled={!page.items.length || page.items.some(item => store.pendingIds.has(item._id))}
                onChange={(_, checked) => setSelection({ scope, ids: checked ? page.items.map(item => item._id) : [] })}
              />
              <Typography variant="body2">เลือกในหน้านี้ {selected.length} รายการ</Typography>
              <Button sx={touchSx} disabled={!selected.length || busy} onClick={() => void mutateSelected('acknowledge')}>
                รับทราบที่เลือก
              </Button>
              <Button sx={touchSx} disabled={!selected.length || busy} onClick={() => void mutateSelected('snooze')}>
                พักเตือนที่เลือก 1 ชั่วโมง
              </Button>
            </Stack>
            {page.items.map(item => (
              <ActionCenterRow
                key={item._id}
                item={item}
                selected={selected.includes(item._id)}
                onSelect={checked => setSelection({ scope, ids: checked ? [...selected, item._id] : selected.filter(id => id !== item._id) })}
              />
            ))}
            {!matching.length && <Typography role="status">ไม่มีงานตามตัวกรองนี้</Typography>}
            <Pagination count={page.pages} page={page.page} onChange={(_, value) => changeFilters({ ...filters, page: value })} siblingCount={0} sx={{ '& .MuiPaginationItem-root': touchSx }} />
          </>
        )}
      </Stack>
    </AdminPageContainer>
  );
}

export default function ActionCenterPage() {
  return (
    <Suspense fallback={<Typography role="status">กำลังโหลดศูนย์งาน</Typography>}>
      <ActionCenterPageContent />
    </Suspense>
  );
}
