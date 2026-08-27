'use client';

import { Box, Button, Card, Checkbox, Chip, LinearProgress, MenuItem, Pagination, Select, Skeleton, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { Product } from '@/lib/contracts';
import { tableShellSx, uiCardSx } from '../../../components/adminUi';
import { EmptyState } from '../../../components/dashboardUi';
import QuickMenuRow from './QuickMenuRow';

export type CategoryTab = { label: string; count: number };

type Props = Readonly<{
  loading: boolean;
  reorderMode: boolean;
  savingOrder: boolean;
  rows: Product[];
  totalProducts: number;
  visibleTotal: number;
  categories: CategoryTab[];
  category: string;
  selected: string[];
  pending: string[];
  page: number;
  pageCount: number;
  rowsPerPage: number;
  pageSizes: number[];
  onCategoryChange: (value: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onSavePrice: (product: Product, price: number) => Promise<void>;
  onToggleActive: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}>;

export default function QuickMenuTable({
  loading,
  reorderMode,
  savingOrder,
  rows,
  totalProducts,
  visibleTotal,
  categories,
  category,
  selected,
  pending,
  page,
  pageCount,
  rowsPerPage,
  pageSizes,
  onCategoryChange,
  onToggleSelectAll,
  onToggleSelect,
  onSavePrice,
  onToggleActive,
  onEdit,
  onDelete,
  onAdd,
  onDragEnd,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const allOnPage = rows.length > 0 && rows.every(product => selected.includes(product.id));
  const someOnPage = rows.some(product => selected.includes(product.id));
  const columnCount = reorderMode ? 6 : 7;

  const body = loading ? (
    Array.from({ length: 7 }, (_, index) => (
      <TableRow key={index}>
        <TableCell colSpan={columnCount}><Skeleton height={38} /></TableCell>
      </TableRow>
    ))
  ) : (
    rows.map((product, index) => (
      <QuickMenuRow
        key={product.id}
        product={product}
        reorderMode={reorderMode}
        position={index}
        selected={selected.includes(product.id)}
        pending={pending.includes(product.id)}
        onToggleSelect={checked => onToggleSelect(product.id, checked)}
        onSavePrice={price => onSavePrice(product, price)}
        onToggleActive={() => onToggleActive(product)}
        onEdit={() => onEdit(product)}
        onDelete={() => onDelete(product)}
      />
    ))
  );

  return (
    <Card sx={{ ...uiCardSx, overflow: 'hidden', borderColor: '#DDE5EF', boxShadow: '0 8px 26px rgba(29,52,84,.06)', display: { xs: 'none', md: 'block' } }}>
      <Tabs
        value={category}
        onChange={(_, value: string) => onCategoryChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 1.5,
          borderBottom: '1px solid #E3EAF4',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 52, color: '#45536C' },
          '& .Mui-selected': { fontWeight: 750 },
          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#075BEE' },
        }}>
        {categories.map(tab => (
          <Tab
            key={tab.label}
            value={tab.label}
            iconPosition="end"
            icon={<Chip size="small" label={tab.count} sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: category === tab.label ? '#E3EDFF' : '#EFF3F9', color: category === tab.label ? '#075BEE' : '#5B6B84' }} />}
            label={tab.label}
          />
        ))}
      </Tabs>
      {reorderMode && (
        <Stack sx={{ px: 2, py: 1.25, bgcolor: '#F4F8FF', borderBottom: '1px solid #E3EAF4' }} spacing={0.75}>
          <Typography fontSize={13} fontWeight={700} color="#1D3A6E">
            โหมดจัดลำดับ — ลากรายการเพื่อเปลี่ยนลำดับการแสดงผลในหน้าขายด่วน ระบบบันทึกให้อัตโนมัติทุกครั้งที่วาง
          </Typography>
          {savingOrder && <LinearProgress sx={{ borderRadius: 1 }} />}
        </Stack>
      )}
      <TableContainer>
        <Table size="small" sx={tableShellSx}>
          <TableHead>
            <TableRow>
              {reorderMode ? (
                <>
                  <TableCell sx={{ width: 46 }} />
                  <TableCell align="center" sx={{ width: 56 }}>ลำดับ</TableCell>
                  <TableCell>สินค้า</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell>ราคา</TableCell>
                  <TableCell>สถานะ</TableCell>
                </>
              ) : (
                <>
                  <TableCell padding="checkbox">
                    <Checkbox checked={allOnPage} indeterminate={someOnPage && !allOnPage} onChange={event => onToggleSelectAll(event.target.checked)} inputProps={{ 'aria-label': 'เลือกทั้งหน้า' }} />
                  </TableCell>
                  <TableCell>สินค้า</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell>ราคา</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>อัปเดตล่าสุด</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {reorderMode ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext items={rows.map(product => product.id)} strategy={verticalListSortingStrategy}>
                  {body}
                </SortableContext>
              </DndContext>
            ) : (
              body
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && visibleTotal === 0 && (
        <Box sx={{ p: 2.5 }}>
          <EmptyState
            eyebrow={totalProducts === 0 ? 'เริ่มต้นใช้งาน' : 'ไม่พบรายการ'}
            title={totalProducts === 0 ? 'ยังไม่มีรายการขายด่วน' : 'ไม่พบรายการที่ค้นหา'}
            subtitle={totalProducts === 0 ? 'เพิ่มสินค้าเพื่อเริ่มใช้งานเมนูขายด่วน' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}
            icon={<Inventory2OutlinedIcon />}
          />
          {totalProducts === 0 && (
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onAdd} sx={{ textTransform: 'none', fontWeight: 700 }}>
                เพิ่มรายการ
              </Button>
            </Stack>
          )}
        </Box>
      )}
      {!loading && visibleTotal > 0 && !reorderMode && (
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={1.5} sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2">แสดงต่อหน้า</Typography>
            <Select size="small" value={rowsPerPage} onChange={event => onRowsPerPageChange(Number(event.target.value))}>
              {pageSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
            </Select>
            <Typography variant="body2" color="text.secondary">
              {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, visibleTotal)} จาก {visibleTotal} รายการ
            </Typography>
          </Stack>
          <Pagination page={page} count={pageCount} onChange={(_, value) => onPageChange(value)} color="primary" size="small" />
        </Stack>
      )}
    </Card>
  );
}
