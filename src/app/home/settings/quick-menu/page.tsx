'use client';

import * as React from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, Typography } from '@mui/material';
import type { DragEndEvent } from '@dnd-kit/core';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AdminPageContainer from '../../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx, heroPrimaryButtonSx } from '../../components/AdminHeroHeader';
import type { Product } from '@/lib/contracts';
import {
  createQuickProduct,
  deleteQuickProduct,
  fetchQuickProductsForAdmin,
  reorderQuickProducts,
  updateQuickProduct,
  type QuickProductPayload,
} from '@/lib/products';
import { computeReorder, moveVisibleRow, sortByDisplayOrder } from './reorder';
import QuickMenuCardList from './components/QuickMenuCardList';
import QuickMenuStats from './components/QuickMenuStats';
import QuickMenuTable, { type CategoryTab } from './components/QuickMenuTable';
import QuickMenuToolbar, { type QuickMenuSort, type QuickMenuStatusFilter } from './components/QuickMenuToolbar';
import QuickSellerEditor from './components/QuickSellerEditor';

const ALL = 'ทั้งหมด';
const PAGE_SIZES = [10, 25, 50, 100];
const EMPTY: QuickProductPayload = { name: '', code: '', category: 'ทั่วไป', price: 0, unitLabel: 'ชิ้น', emoji: '📄', tint: '#E2E8F0', active: true, isHotMenu: false, quickSaleSortOrder: 0 };

const toPayload = (product: Product): QuickProductPayload => ({
  name: product.name,
  code: product.code,
  typeCode: product.typeCode,
  category: product.category,
  price: product.variants[0]?.price ?? 0,
  unitLabel: product.unitLabel,
  emoji: product.emoji,
  tint: product.tint,
  isHotMenu: product.isHotMenu,
  active: product.active,
  quickSaleSortOrder: product.quickSaleSortOrder ?? 0,
});

export default function QuickMenuSettingsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState(ALL);
  const [status, setStatus] = React.useState<QuickMenuStatusFilter>('all');
  const [sort, setSort] = React.useState<QuickMenuSort>('order');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<string[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [draft, setDraft] = React.useState<QuickProductPayload>(EMPTY);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [reorderMode, setReorderMode] = React.useState(false);
  const [savingOrder, setSavingOrder] = React.useState(false);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const busy = pending.length > 0 || savingOrder || bulkBusy;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchQuickProductsForAdmin());
      setLastSyncedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดรายการขายด่วนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => setPage(1), [query, category, status, sort, rowsPerPage]);

  const categoryNames = React.useMemo(
    () => Array.from(new Set(products.map(product => product.category))).sort((a, b) => a.localeCompare(b, 'th')),
    [products]
  );
  const categoryTabs = React.useMemo<CategoryTab[]>(
    () => [
      { label: ALL, count: products.length },
      ...categoryNames.map(name => ({ label: name, count: products.filter(product => product.category === name).length })),
    ],
    [products, categoryNames]
  );

  const visible = React.useMemo(
    () =>
      products
        .filter(product => `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase()))
        .filter(product => category === ALL || product.category === category)
        .filter(product => status === 'all' || (status === 'active' ? product.active : !product.active))
        .sort((a, b) =>
          sort === 'name'
            ? a.name.localeCompare(b.name, 'th')
            : sort === 'updated'
              ? (b.updatedAt || '').localeCompare(a.updatedAt || '')
              : (a.quickSaleSortOrder ?? 0) - (b.quickSaleSortOrder ?? 0)
        ),
    [products, query, category, status, sort]
  );
  const paged = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.max(1, Math.ceil(visible.length / rowsPerPage));

  // In reorder mode the whole (category-filtered) list is shown so a drop target is never off-page.
  const reorderRows = React.useMemo(
    () => sortByDisplayOrder(products).filter(product => category === ALL || product.category === category),
    [products, category]
  );
  const rows = reorderMode ? reorderRows : paged;

  const patchRow = async (product: Product, patch: Partial<QuickProductPayload>, message: string) => {
    if (pending.includes(product.id)) return;
    setPending(ids => [...ids, product.id]);
    setError(null);
    try {
      const updated = await updateQuickProduct(product.id, patch);
      setProducts(items => items.map(item => (item.id === product.id ? updated : item)));
      setNotice(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'อัปเดตรายการไม่สำเร็จ');
      throw e;
    } finally {
      setPending(ids => ids.filter(id => id !== product.id));
    }
  };

  const openEditor = (product: Product | null) => {
    setEditing(product);
    setDraft(product ? toPayload(product) : EMPTY);
    setEditorOpen(true);
  };

  const saveEditor = async (value: QuickProductPayload) => {
    const id = editing?.id ?? 'new';
    setPending(ids => [...ids, id]);
    setError(null);
    try {
      const saved = editing ? await updateQuickProduct(editing.id, value) : await createQuickProduct(value);
      setProducts(items => (editing ? items.map(item => (item.id === editing.id ? saved : item)) : [...items, saved]));
      setEditorOpen(false);
      setNotice(editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มรายการขายด่วนแล้ว');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกรายการไม่สำเร็จ');
    } finally {
      setPending(ids => ids.filter(item => item !== id));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setPending(ids => [...ids, target.id]);
    try {
      await deleteQuickProduct(target.id);
      setProducts(items => items.filter(item => item.id !== target.id));
      setSelected(ids => ids.filter(id => id !== target.id));
      setDeleteTarget(null);
      setNotice('ลบรายการแล้ว');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ลบรายการไม่สำเร็จ');
    } finally {
      setPending(ids => ids.filter(id => id !== target.id));
    }
  };

  const toggleReorderMode = () => {
    if (!reorderMode) {
      setSort('order');
      setQuery('');
      setStatus('all');
      setSelected([]);
    }
    setReorderMode(mode => !mode);
  };

  const applyReorder = async (result: ReturnType<typeof computeReorder>) => {
    const { next, changes } = result;
    if (!changes.length) return;
    const snapshot = products;
    setProducts(next);
    setSavingOrder(true);
    setError(null);
    try {
      const fresh = await reorderQuickProducts(changes);
      if (fresh.length) setProducts(fresh);
      setNotice('บันทึกลำดับแล้ว');
    } catch (e) {
      setProducts(snapshot);
      setError(e instanceof Error ? e.message : 'บันทึกลำดับไม่สำเร็จ');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || savingOrder) return;
    const visibleIds = reorderRows.map(product => product.id);
    void applyReorder(moveVisibleRow(sortByDisplayOrder(products), visibleIds, String(active.id), String(over.id)));
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    if (savingOrder) return;
    const visibleIds = reorderRows.map(product => product.id);
    const fromIndex = visibleIds.indexOf(id);
    void applyReorder(computeReorder(sortByDisplayOrder(products), visibleIds, fromIndex, fromIndex + direction));
  };

  const bulkSetActive = async (active: boolean) => {
    const targets = products.filter(product => selected.includes(product.id) && product.active !== active);
    if (!targets.length) {
      setSelected([]);
      return;
    }
    setBulkBusy(true);
    setError(null);
    const results = await Promise.allSettled(targets.map(product => updateQuickProduct(product.id, { active })));
    const updatedById = new Map<string, Product>();
    results.forEach(result => {
      if (result.status === 'fulfilled') updatedById.set(result.value.id, result.value);
    });
    setProducts(items => items.map(item => updatedById.get(item.id) ?? item));
    const failed = results.length - updatedById.size;
    if (failed > 0) setError(`${active ? 'เปิด' : 'ปิด'}ใช้งานไม่สำเร็จ ${failed} รายการ`);
    setNotice(`${active ? 'เปิด' : 'ปิด'}ใช้งานแล้ว ${updatedById.size} รายการ`);
    setSelected([]);
    setBulkBusy(false);
  };

  const bulkDelete = async () => {
    const targets = selected;
    setBulkBusy(true);
    setError(null);
    const results = await Promise.allSettled(targets.map(id => deleteQuickProduct(id).then(() => id)));
    const removedIds = new Set(results.filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled').map(result => result.value));
    setProducts(items => items.filter(item => !removedIds.has(item.id)));
    const failed = targets.length - removedIds.size;
    if (failed > 0) setError(`ลบไม่สำเร็จ ${failed} รายการ`);
    setNotice(`ลบแล้ว ${removedIds.size} รายการ`);
    setSelected([]);
    setBulkDeleteOpen(false);
    setBulkBusy(false);
  };

  return (
    <AdminPageContainer>
      <Stack spacing={2.25} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiButton-root': { textTransform: 'none' } }}>
        <AdminHeroHeader
          title="Quick Menu Settings"
          description="จัดการรายการสินค้า ราคาหน้าร้าน และลำดับการแสดงผลในหน้าขายด่วน"
          lastSynced={formatAdminLastSynced(lastSyncedAt)}
          thaiDate={formatAdminThaiDate(lastSyncedAt)}
          mb={0}
          actions={
            <>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void load()} disabled={loading} sx={heroOutlineButtonSx}>
                {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
              </Button>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openEditor(null)} sx={heroPrimaryButtonSx}>
                เพิ่มรายการใหม่
              </Button>
            </>
          }
        />
        {error && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void load()}>ลองใหม่</Button>} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <QuickMenuStats total={products.length} activeCount={products.filter(product => product.active).length} categoryCount={categoryNames.length} />
        <QuickMenuToolbar
          query={query}
          status={status}
          sort={sort}
          reorderMode={reorderMode}
          busy={busy}
          selectedCount={selected.length}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onToggleReorderMode={toggleReorderMode}
          onBulkSetActive={active => void bulkSetActive(active)}
          onBulkDelete={() => setBulkDeleteOpen(true)}
          onClearSelection={() => setSelected([])}
        />
        <QuickMenuTable
          loading={loading}
          reorderMode={reorderMode}
          savingOrder={savingOrder}
          rows={rows}
          totalProducts={products.length}
          visibleTotal={reorderMode ? reorderRows.length : visible.length}
          categories={categoryTabs}
          category={category}
          selected={selected}
          pending={pending}
          page={page}
          pageCount={pageCount}
          rowsPerPage={rowsPerPage}
          pageSizes={PAGE_SIZES}
          onCategoryChange={setCategory}
          onToggleSelectAll={checked =>
            setSelected(ids => (checked ? Array.from(new Set([...ids, ...paged.map(product => product.id)])) : ids.filter(id => !paged.some(product => product.id === id))))
          }
          onToggleSelect={(id, checked) => setSelected(ids => (checked ? [...ids, id] : ids.filter(item => item !== id)))}
          onSavePrice={(product, price) => patchRow(product, { price }, 'อัปเดตราคาแล้ว')}
          onToggleActive={product => void patchRow(product, { active: !product.active }, product.active ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว')}
          onEdit={openEditor}
          onDelete={setDeleteTarget}
          onAdd={() => openEditor(null)}
          onDragEnd={handleDragEnd}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
        <QuickMenuCardList
          loading={loading}
          reorderMode={reorderMode}
          rows={rows}
          totalProducts={products.length}
          categories={categoryTabs}
          category={category}
          selected={selected}
          pending={pending}
          onCategoryChange={setCategory}
          onToggleSelect={(id, checked) => setSelected(ids => (checked ? [...ids, id] : ids.filter(item => item !== id)))}
          onSavePrice={(product, price) => patchRow(product, { price }, 'อัปเดตราคาแล้ว')}
          onToggleActive={product => void patchRow(product, { active: !product.active }, product.active ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว')}
          onEdit={openEditor}
          onDelete={setDeleteTarget}
          onAdd={() => openEditor(null)}
          onMove={handleMove}
        />
      </Stack>
      <QuickSellerEditor open={editorOpen} initial={draft} editing={editing} busy={busy} onClose={() => setEditorOpen(false)} onSave={saveEditor} />
      <Dialog open={Boolean(deleteTarget)} onClose={() => !busy && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ยืนยันการลบรายการ</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบ “{deleteTarget?.name}” หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={busy}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={() => void remove()} disabled={busy}>ลบรายการ</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={bulkDeleteOpen} onClose={() => !busy && setBulkDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ยืนยันการลบ {selected.length} รายการ</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบรายการที่เลือกทั้งหมด {selected.length} รายการหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={busy}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={() => void bulkDelete()} disabled={busy}>ลบทั้งหมด</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={2600} onClose={() => setNotice(null)} message={`✓ ${notice ?? ''}`} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </AdminPageContainer>
  );
}
