'use client';

import * as React from 'react';
import { Box, Button, Card, Checkbox, Chip, LinearProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { Product } from '@/lib/contracts';
import DataTable, { type DataTableColumn } from '../../../components/DataTable';
import { uiCardSx } from '../../../components/adminUi';
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const allOnPage = rows.length > 0 && rows.every(product => selected.includes(product.id));
  const someOnPage = rows.some(product => selected.includes(product.id));

  const columns: DataTableColumn<Product>[] = reorderMode
    ? [
        { key: 'drag', header: '', width: 46 },
        { key: 'position', header: 'ลำดับ', align: 'center', width: 56 },
        { key: 'product', header: 'สินค้า' },
        { key: 'category', header: 'หมวดหมู่' },
        { key: 'price', header: 'ราคา' },
        { key: 'status', header: 'สถานะ' },
      ]
    : [
        {
          key: 'select',
          header: (
            <Checkbox
              checked={allOnPage}
              indeterminate={someOnPage && !allOnPage}
              onChange={event => onToggleSelectAll(event.target.checked)}
              inputProps={{ 'aria-label': 'เลือกทั้งหน้า' }}
            />
          ),
          padding: 'checkbox',
          width: 56,
        },
        { key: 'product', header: 'สินค้า' },
        { key: 'category', header: 'หมวดหมู่' },
        { key: 'price', header: 'ราคา' },
        { key: 'status', header: 'สถานะ' },
        { key: 'updatedAt', header: 'อัปเดตล่าสุด' },
        { key: 'actions', header: 'จัดการ', align: 'right' },
      ];

  const wrapRows = reorderMode
    ? (rowNodes: React.ReactNode) => (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map(product => product.id)} strategy={verticalListSortingStrategy}>
            {rowNodes}
          </SortableContext>
        </DndContext>
      )
    : undefined;

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

      {reorderMode ? (
        <Stack sx={{ px: 2, py: 1.25, bgcolor: '#F4F8FF', borderBottom: '1px solid #E3EAF4' }} spacing={0.75}>
          <Typography fontSize={13} fontWeight={700} color="#1D3A6E">
            โหมดจัดลำดับ — ลากรายการเพื่อเปลี่ยนลำดับการแสดงผลในหน้าขายด่วน ระบบบันทึกให้อัตโนมัติทุกครั้งที่วาง
          </Typography>
          {savingOrder ? <LinearProgress sx={{ borderRadius: 1 }} /> : null}
        </Stack>
      ) : null}

      <DataTable
        sectionHeader={{
          title: 'รายการขายด่วนทั้งหมด',
          subtitle: `${visibleTotal.toLocaleString('th-TH')} รายการตามตัวกรองล่าสุด`,
          countLabel: `${visibleTotal.toLocaleString('th-TH')} รายการ`,
        }}
        columns={columns}
        rows={rows}
        getRowKey={product => product.id}
        minWidth={reorderMode ? 760 : 980}
        loading={loading}
        skeletonRowCount={7}
        emptyState={{
          icon: <Inventory2OutlinedIcon />,
          eyebrow: totalProducts === 0 ? 'เริ่มต้นใช้งาน' : 'ไม่พบรายการ',
          title: totalProducts === 0 ? 'ยังไม่มีรายการขายด่วน' : 'ไม่พบรายการที่ค้นหา',
          subtitle: totalProducts === 0 ? 'เพิ่มสินค้าเพื่อเริ่มใช้งานเมนูขายด่วน' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง',
        }}
        renderRow={({ row, index }) => (
          <QuickMenuRow
            product={row}
            reorderMode={reorderMode}
            position={index}
            selected={selected.includes(row.id)}
            pending={pending.includes(row.id)}
            onToggleSelect={checked => onToggleSelect(row.id, checked)}
            onSavePrice={price => onSavePrice(row, price)}
            onToggleActive={() => onToggleActive(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
          />
        )}
        wrapRows={wrapRows}
        pagination={!loading && visibleTotal > 0 && !reorderMode ? {
          count: visibleTotal,
          page: Math.max(page - 1, 0),
          rowsPerPage,
          onPageChange: nextPage => onPageChange(nextPage + 1),
          onRowsPerPageChange,
          rowsPerPageOptions: pageSizes,
        } : undefined}
      />

      {!loading && totalProducts === 0 ? (
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Stack alignItems="center">
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onAdd} sx={{ textTransform: 'none', fontWeight: 700 }}>
              เพิ่มรายการ
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Card>
  );
}
