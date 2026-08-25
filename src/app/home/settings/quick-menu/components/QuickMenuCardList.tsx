'use client';

import * as React from 'react';
import { Box, Button, Card, CardContent, Checkbox, Chip, IconButton, Skeleton, Stack, Switch, Tab, Tabs, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { Product } from '@/lib/contracts';
import { uiCardSx } from '../../../components/adminUi';
import { EmptyState } from '../../../components/dashboardUi';
import InlinePriceEditor from './InlinePriceEditor';
import { formatQuickMenuDate, ProductCell } from './QuickMenuRow';
import type { CategoryTab } from './QuickMenuTable';

type Props = Readonly<{
  loading: boolean;
  reorderMode: boolean;
  rows: Product[];
  totalProducts: number;
  categories: CategoryTab[];
  category: string;
  selected: string[];
  pending: string[];
  onCategoryChange: (value: string) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onSavePrice: (product: Product, price: number) => Promise<void>;
  onToggleActive: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: () => void;
  onMove: (id: string, direction: -1 | 1) => void;
}>;

export default function QuickMenuCardList({
  loading,
  reorderMode,
  rows,
  totalProducts,
  categories,
  category,
  selected,
  pending,
  onCategoryChange,
  onToggleSelect,
  onSavePrice,
  onToggleActive,
  onEdit,
  onDelete,
  onAdd,
  onMove,
}: Props) {
  return (
    <Card sx={{ ...uiCardSx, overflow: 'hidden', borderColor: '#DDE5EF', display: { xs: 'block', md: 'none' } }}>
      <Tabs
        value={category}
        onChange={(_, value: string) => onCategoryChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 1,
          borderBottom: '1px solid #E3EAF4',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#075BEE' },
        }}>
        {categories.map(tab => (
          <Tab key={tab.label} value={tab.label} label={`${tab.label} (${tab.count})`} />
        ))}
      </Tabs>
      <Stack sx={{ p: 1.25 }} spacing={1}>
        {loading && Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="rounded" height={150} />)}
        {!loading && rows.map((product, index) => (
          <Card key={product.id} variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#E3EAF4', opacity: product.active ? 1 : 0.62 }}>
            <CardContent sx={{ p: '14px !important' }}>
              <Stack direction="row" alignItems="flex-start" gap={1}>
                {reorderMode ? (
                  <Box sx={{ width: 26, height: 26, mt: 0.5, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: '#EFF4FE', color: '#2B62EE', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {index + 1}
                  </Box>
                ) : (
                  <Checkbox size="small" checked={selected.includes(product.id)} onChange={event => onToggleSelect(product.id, event.target.checked)} sx={{ mt: -0.25, ml: -0.75 }} />
                )}
                <Box flex={1} minWidth={0}>
                  <ProductCell product={product} size={42} />
                </Box>
                {reorderMode ? (
                  <Stack direction="row">
                    <IconButton size="small" aria-label={`เลื่อน ${product.name} ขึ้น`} disabled={index === 0} onClick={() => onMove(product.id, -1)}>
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label={`เลื่อน ${product.name} ลง`} disabled={index === rows.length - 1} onClick={() => onMove(product.id, 1)}>
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row">
                    <IconButton size="small" onClick={() => onEdit(product)}><EditRoundedIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(product)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
                  </Stack>
                )}
              </Stack>
              {!reorderMode && (
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                  <InlinePriceEditor value={product.variants[0]?.price ?? 0} disabled={pending.includes(product.id)} onSave={price => onSavePrice(product, price)} />
                  <Switch checked={product.active} disabled={pending.includes(product.id)} onChange={() => onToggleActive(product)} />
                </Stack>
              )}
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 1 }}>
                <Chip size="small" label={product.category} variant="outlined" sx={{ height: 22 }} />
                <Typography variant="caption" color="text.secondary">{formatQuickMenuDate(product.updatedAt)}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {!loading && rows.length === 0 && (
          <Box sx={{ py: 1 }}>
            <EmptyState
              compact
              eyebrow={totalProducts === 0 ? 'เริ่มต้นใช้งาน' : 'ไม่พบรายการ'}
              title={totalProducts === 0 ? 'ยังไม่มีรายการขายด่วน' : 'ไม่พบรายการที่ค้นหา'}
              subtitle={totalProducts === 0 ? 'เพิ่มสินค้าเพื่อเริ่มใช้งานเมนูขายด่วน' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}
              icon={<Inventory2OutlinedIcon />}
            />
            {totalProducts === 0 && (
              <Stack alignItems="center" sx={{ mt: 1.5 }}>
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onAdd} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  เพิ่มรายการ
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </Card>
  );
}
