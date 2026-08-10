'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PhotoRoundedIcon from '@mui/icons-material/PhotoRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ScannerRoundedIcon from '@mui/icons-material/ScannerRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';

import type { DiscountMode } from '../quickSale';
import { roundMoney } from '../quickSale';

export type QuickSaleCartItem = {
  key: string;
  productId?: string;
  productCode?: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
};

type QuickSaleTotals = {
  subtotal: number;
  discount: number;
  grandTotal: number;
};

type QuickSellerCartProps = Readonly<{
  items: QuickSaleCartItem[];
  setItems: React.Dispatch<React.SetStateAction<QuickSaleCartItem[]>>;
  totals: QuickSaleTotals;
  discountValue: number;
  discountMode: DiscountMode;
  setDiscountValue: (value: number) => void;
  setDiscountMode: (mode: DiscountMode) => void;
  onCheckout: () => void;
}>;

const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getItemVisual(item: QuickSaleCartItem): { Icon: React.ElementType; background: string; color: string } {
  const identity = `${item.productName} ${item.category} ${item.productCode ?? ''}`.toLowerCase();
  if (/นามบัตร|name.?card|business.?card/u.test(identity)) return { Icon: BadgeRoundedIcon, background: '#E0F2FE', color: '#0284C7' };
  if (/สติ๊กเกอร์|sticker|label/u.test(identity)) return { Icon: SellRoundedIcon, background: '#FEF3C7', color: '#D97706' };
  if (/รูป|photo|ภาพ/u.test(identity)) return { Icon: PhotoRoundedIcon, background: '#FCE7F3', color: '#DB2777' };
  if (/สแกน|scan/u.test(identity)) return { Icon: ScannerRoundedIcon, background: '#E0F2FE', color: '#0369A1' };
  if (/เข้าเล่ม|binding|book/u.test(identity)) return { Icon: MenuBookRoundedIcon, background: '#EDE9FE', color: '#7C3AED' };
  if (/เคลือบ|laminat|coat/u.test(identity)) return { Icon: LayersRoundedIcon, background: '#DCFCE7', color: '#16A34A' };
  if (/ตัด|cut/u.test(identity)) return { Icon: ContentCutRoundedIcon, background: '#FFEDD5', color: '#EA580C' };
  if (/พิมพ์|ปริ้น|print|inkjet|plot/u.test(identity)) return { Icon: LocalPrintshopRoundedIcon, background: '#DBEAFE', color: '#2563EB' };
  return { Icon: ArticleRoundedIcon, background: '#EEF2F7', color: '#52657C' };
}

function QuantityControl({ item, onChange }: Readonly<{ item: QuickSaleCartItem; onChange: (quantity: number) => void }>) {
  return (
    <Stack direction="row" alignItems="center" sx={{ height: 40, border: '1px solid #D8E1EC', borderRadius: 2.5, overflow: 'hidden', bgcolor: '#FFFFFF' }}>
      <IconButton aria-label={`ลดจำนวน ${item.productName}`} onClick={() => onChange(Math.max(1, item.quantity - 1))} sx={{ borderRadius: 0, width: 40, height: 40, color: '#475569' }}>
        <RemoveRoundedIcon fontSize="small" />
      </IconButton>
      <TextField
        variant="standard"
        type="number"
        value={item.quantity}
        inputProps={{ min: 1, 'aria-label': `จำนวน ${item.productName}` }}
        onChange={event => onChange(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
        InputProps={{ disableUnderline: true }}
        sx={{ width: 46, '& input': { textAlign: 'center', p: 0, fontWeight: 800, fontVariantNumeric: 'tabular-nums' } }}
      />
      <IconButton aria-label={`เพิ่มจำนวน ${item.productName}`} onClick={() => onChange(item.quantity + 1)} sx={{ borderRadius: 0, width: 40, height: 40, color: '#1463E9' }}>
        <AddRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function PriceEditor({ item, onCommit }: Readonly<{ item: QuickSaleCartItem; onCommit: (unitPrice: number) => void }>) {
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(null);
  const [draft, setDraft] = React.useState(String(item.unitPrice));
  const editing = Boolean(anchorElement);

  React.useEffect(() => {
    if (!editing) setDraft(String(item.unitPrice));
  }, [editing, item.unitPrice]);

  const commit = () => {
    const nextPrice = Number(draft);
    if (draft.trim() && Number.isFinite(nextPrice) && nextPrice >= 0) onCommit(nextPrice);
    else setDraft(String(item.unitPrice));
    setAnchorElement(null);
  };

  const cancel = () => {
    setDraft(String(item.unitPrice));
    setAnchorElement(null);
  };

  return (
    <>
      <Button
        size="small"
        variant="text"
        onClick={event => {
          setDraft(String(item.unitPrice));
          setAnchorElement(event.currentTarget);
        }}
        endIcon={<EditRoundedIcon sx={{ fontSize: '15px !important' }} />}
        sx={{ minHeight: 30, px: 0.25, borderRadius: 1.5, color: '#52657C', fontSize: 12.5, fontWeight: 600, textTransform: 'none', justifyContent: 'flex-start', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}>
        <Box component="span" sx={{ fontWeight: 800, color: '#334155', fontVariantNumeric: 'tabular-nums' }}>฿{money.format(item.unitPrice)}</Box>&nbsp;/ หน่วย
      </Button>
      <Popover
        open={editing}
        anchorEl={anchorElement}
        onClose={cancel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 286, mt: 0.75, p: 1.75, borderRadius: 3, border: '1px solid #DCE4EF', boxShadow: '0 16px 42px rgba(15, 23, 42, 0.16)' } } }}>
        <Stack gap={1.25}>
          <Box>
            <Typography fontSize={14} fontWeight={900} color="#172033">แก้ไขราคาต่อหน่วย</Typography>
            <Typography variant="caption" color="text.secondary">{item.productName}</Typography>
          </Box>
          <TextField
            autoFocus
            fullWidth
            type="number"
            value={draft}
            inputProps={{ min: 0, step: 0.01, inputMode: 'decimal', 'aria-label': `ราคา/หน่วย ${item.productName}` }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Typography fontSize={19} fontWeight={900}>฿</Typography></InputAdornment> }}
            onChange={event => setDraft(event.target.value)}
            onFocus={event => event.target.select()}
            onKeyDown={event => {
              if (event.key === 'Enter') commit();
              if (event.key === 'Escape') cancel();
            }}
            sx={{ '& .MuiOutlinedInput-root': { height: 52, borderRadius: 2.5 }, '& input': { fontSize: 20, fontWeight: 900, fontVariantNumeric: 'tabular-nums' } }}
          />
          <Stack direction="row" gap={1}>
            <Button fullWidth color="inherit" variant="outlined" onClick={cancel} sx={{ minHeight: 40, borderRadius: 2.25, borderColor: '#D8E1EC' }}>ยกเลิก</Button>
            <Button fullWidth variant="contained" startIcon={<CheckRoundedIcon />} onClick={commit} sx={{ minHeight: 40, borderRadius: 2.25, fontWeight: 800 }}>บันทึก</Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}

function CartItemRow({ item, onUpdate, onRemove }: Readonly<{ item: QuickSaleCartItem; onUpdate: (values: Partial<QuickSaleCartItem>) => void; onRemove: () => void }>) {
  const visual = getItemVisual(item);
  return (
    <Box sx={{ py: 1.5, borderBottom: '1px solid #E8EDF4', transition: 'background-color 160ms ease', '&:hover': { bgcolor: '#FAFCFF' } }}>
      <Box sx={{ position: 'relative', textAlign: 'center', px: 4.5 }}>
        <Box sx={{ width: 46, height: 46, mx: 'auto', borderRadius: 2.75, display: 'grid', placeItems: 'center', bgcolor: visual.background, color: visual.color }}>
          <visual.Icon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0, mt: 0.75 }}>
          <Typography noWrap fontWeight={700} color="#172033" lineHeight={1.3} title={item.productName}>{item.productName}</Typography>
          <PriceEditor item={item} onCommit={unitPrice => onUpdate({ unitPrice })} />
        </Box>
        <Tooltip title="ลบรายการ">
          <IconButton
            aria-label={`ลบ ${item.productName}`}
            onClick={onRemove}
            sx={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5} sx={{ mt: 1.1 }}>
        <QuantityControl item={item} onChange={quantity => onUpdate({ quantity })} />
        <Typography noWrap fontSize={17} fontWeight={800} color="#0F172A" sx={{ minWidth: 92, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          ฿{money.format(roundMoney(item.quantity * item.unitPrice))}
        </Typography>
      </Stack>
    </Box>
  );
}

function DiscountControl({ value, mode, appliedDiscount, onApplyMode, onApplyValue }: Readonly<{ value: number; mode: DiscountMode; appliedDiscount: number; onApplyMode: (mode: DiscountMode) => void; onApplyValue: (value: number) => void }>) {
  const [open, setOpen] = React.useState(false);
  const [draftMode, setDraftMode] = React.useState<DiscountMode>(mode);
  const [draftValue, setDraftValue] = React.useState(String(value));

  const openEditor = () => {
    setDraftMode(mode);
    setDraftValue(String(value));
    setOpen(true);
  };
  const apply = () => {
    onApplyMode(draftMode);
    onApplyValue(Math.max(0, Number(draftValue) || 0));
    setOpen(false);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography color="#64748B" fontSize={14}>ส่วนลด</Typography>
          <Button size="small" variant="text" startIcon={<AddRoundedIcon />} onClick={openEditor} sx={{ minHeight: 28, px: 0.5, fontSize: 12, fontWeight: 700 }}>
            {appliedDiscount > 0 ? 'แก้ไข' : 'เพิ่มส่วนลด'}
          </Button>
        </Stack>
        <Typography color={appliedDiscount > 0 ? '#DC2626' : '#475569'} fontWeight={600}>-฿{money.format(appliedDiscount)}</Typography>
      </Stack>
      {open && (
        <Stack gap={1} sx={{ mt: 1.1, p: 1.25, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Stack direction="row" gap={0.75}>
            <Button fullWidth size="small" variant={draftMode === 'amount' ? 'contained' : 'outlined'} onClick={() => setDraftMode('amount')}>฿ บาท</Button>
            <Button fullWidth size="small" variant={draftMode === 'percent' ? 'contained' : 'outlined'} onClick={() => setDraftMode('percent')}>%</Button>
          </Stack>
          <Stack direction="row" gap={0.75}>
            <TextField autoFocus fullWidth size="small" type="number" value={draftValue} inputProps={{ min: 0 }} onChange={event => setDraftValue(event.target.value)} onKeyDown={event => event.key === 'Enter' && apply()} />
            <Button variant="contained" onClick={apply} sx={{ minWidth: 74 }}>ใช้</Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

export default function QuickSellerCart({ items, setItems, totals, discountValue, discountMode, setDiscountValue, setDiscountMode, onCheckout }: QuickSellerCartProps) {
  const updateItem = (key: string, values: Partial<QuickSaleCartItem>) => {
    setItems(previous => previous.map(item => (item.key === key ? { ...item, ...values } : item)));
  };

  return (
    <Stack sx={{ height: '100%', minHeight: 0, bgcolor: '#FFFFFF' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.25, py: 1.65, flexShrink: 0 }}>
        <Box>
          <Typography fontSize={17} fontWeight={800} color="#0F172A">รายการขาย</Typography>
          <Typography variant="body2" color="text.secondary">{items.length} รายการ</Typography>
        </Box>
        <Tooltip title="ล้างรายการทั้งหมด">
          <span>
            <IconButton
              disabled={!items.length}
              aria-label="ล้างรายการทั้งหมด"
              onClick={() => setItems([])}
              sx={{ color: '#64748B', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
              <DeleteSweepRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2 }}>
        {items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" textAlign="center" sx={{ minHeight: 260, color: 'text.secondary' }}>
            <Box sx={{ width: 52, height: 52, mb: 1.25, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: '#F1F5F9', color: '#94A3B8' }}>
              <ShoppingCartRoundedIcon sx={{ fontSize: 27 }} />
            </Box>
            <Typography fontWeight={700} color="#475569">ยังไม่มีรายการ</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>เลือกสินค้าจากเมนูด้านซ้าย<br />เพื่อเริ่มการขาย</Typography>
          </Stack>
        ) : (
          items.map(item => (
            <CartItemRow
              key={item.key}
              item={item}
              onUpdate={values => updateItem(item.key, values)}
              onRemove={() => setItems(previous => previous.filter(row => row.key !== item.key))}
            />
          ))
        )}
      </Box>

      <Divider />
      <Stack gap={1.2} sx={{ p: 2, flexShrink: 0, bgcolor: '#FFFFFF', boxShadow: '0 -10px 26px rgba(15, 23, 42, 0.035)' }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="#64748B" fontSize={14}>ยอดรวม</Typography>
          <Typography fontWeight={700}>฿{money.format(totals.subtotal)}</Typography>
        </Stack>
        <DiscountControl
          value={discountValue}
          mode={discountMode}
          appliedDiscount={totals.discount}
          onApplyMode={setDiscountMode}
          onApplyValue={setDiscountValue}
        />
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography fontWeight={800} color="#25324A">ยอดสุทธิ</Typography>
          <Typography noWrap fontSize={{ xs: 27, md: 30 }} color={items.length ? '#1463E9' : '#94A3B8'} fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            ฿{money.format(totals.grandTotal)}
          </Typography>
        </Stack>
        <Button
          fullWidth
          variant="contained"
          disabled={!items.length}
          onClick={onCheckout}
          sx={{ minHeight: 62, borderRadius: 3, px: 2, bgcolor: '#1463E9', boxShadow: items.length ? '0 10px 24px rgba(20, 99, 233, 0.24)' : 'none', '&:hover': { bgcolor: '#0F56CF' } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
            <Stack direction="row" alignItems="center" gap={1}>
              <LocalPrintshopRoundedIcon />
              <Typography fontSize={16} fontWeight={800}>ชำระเงิน</Typography>
            </Stack>
            <Typography fontSize={18} fontWeight={900}>฿{money.format(totals.grandTotal)}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.82 }}>F9</Typography>
          </Stack>
        </Button>
      </Stack>
    </Stack>
  );
}
