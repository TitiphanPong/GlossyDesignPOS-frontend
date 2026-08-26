'use client';

import { Box, Checkbox, Chip, IconButton, Stack, Switch, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import type { Product } from '@/lib/contracts';
import InlinePriceEditor from './InlinePriceEditor';
import QuickSellerStatusChip from './QuickSellerStatusChip';

export const formatQuickMenuDate = (value?: string) =>
  value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export function ProductCell({ product, size = 38 }: Readonly<{ product: Product; size?: number }>) {
  return (
    <Stack direction="row" alignItems="center" gap={1.25}>
      <Box sx={{ width: size, height: size, flexShrink: 0, borderRadius: 1.75, bgcolor: product.tint || '#EEF2F6', display: 'grid', placeItems: 'center', fontSize: size * 0.55 }}>
        {product.emoji || '📄'}
      </Box>
      <Box minWidth={0}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography fontWeight={750} fontSize={14} noWrap>{product.name}</Typography>
          {product.isHotMenu && <Chip size="small" label="🔥 แนะนำ" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#FFF3E6', color: '#C2540A' }} />}
        </Stack>
        <Typography variant="caption" color="text.secondary">{product.code}</Typography>
      </Box>
    </Stack>
  );
}

type Props = Readonly<{
  product: Product;
  reorderMode: boolean;
  position: number;
  selected: boolean;
  pending: boolean;
  onToggleSelect: (checked: boolean) => void;
  onSavePrice: (price: number) => Promise<void>;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}>;

export default function QuickMenuRow({ product, reorderMode, position, selected, pending, onToggleSelect, onSavePrice, onToggleActive, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id, disabled: !reorderMode });

  return (
    <TableRow
      ref={setNodeRef}
      hover={!reorderMode}
      sx={{
        opacity: isDragging ? 0.5 : product.active ? 1 : 0.62,
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging && { position: 'relative', zIndex: 2, bgcolor: '#F3F7FF' }),
      }}>
      {reorderMode ? (
        <>
          <TableCell sx={{ width: 46 }}>
            <IconButton
              size="small"
              aria-label={`ลากเพื่อจัดลำดับ ${product.name}`}
              sx={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', color: '#5B6B84' }}
              {...attributes}
              {...listeners}>
              <DragIndicatorRoundedIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell align="center" sx={{ width: 56 }}>
            <Box sx={{ width: 28, height: 28, mx: 'auto', borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: '#EFF4FE', color: '#2B62EE', fontSize: 12.5, fontWeight: 800 }}>
              {position + 1}
            </Box>
          </TableCell>
          <TableCell><ProductCell product={product} /></TableCell>
          <TableCell><Chip size="small" label={product.category} variant="outlined" /></TableCell>
          <TableCell>
            <Typography fontWeight={650} fontSize={14}>฿{(product.variants[0]?.price ?? 0).toFixed(2)}</Typography>
          </TableCell>
          <TableCell><QuickSellerStatusChip active={product.active} /></TableCell>
        </>
      ) : (
        <>
          <TableCell padding="checkbox">
            <Checkbox checked={selected} onChange={event => onToggleSelect(event.target.checked)} inputProps={{ 'aria-label': `เลือก ${product.name}` }} />
          </TableCell>
          <TableCell><ProductCell product={product} /></TableCell>
          <TableCell><Chip size="small" label={product.category} variant="outlined" /></TableCell>
          <TableCell><InlinePriceEditor value={product.variants[0]?.price ?? 0} disabled={pending} onSave={onSavePrice} /></TableCell>
          <TableCell>
            <Stack direction="row" alignItems="center">
              <Switch size="small" checked={product.active} disabled={pending} onChange={onToggleActive} />
              <Typography variant="caption" fontWeight={700} color={product.active ? 'success.main' : 'text.secondary'}>
                {product.active ? 'ใช้งาน' : 'ปิด'}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell><Typography variant="caption">{formatQuickMenuDate(product.updatedAt)}</Typography></TableCell>
          <TableCell align="right">
            <Tooltip title="แก้ไข"><IconButton size="small" onClick={onEdit}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="ลบ"><IconButton size="small" color="error" onClick={onDelete}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
