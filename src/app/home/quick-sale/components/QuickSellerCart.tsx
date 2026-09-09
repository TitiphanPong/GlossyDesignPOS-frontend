'use client';

import * as React from 'react';
import { Box, Button, Divider, IconButton, InputAdornment, Popover, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
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

import type { QuickSaleV2DocumentSelection } from '@/lib/quickSaleV2';
import type { DiscountMode } from '../quickSale';
import { isDefaultVariantName, roundMoney } from '../quickSale';
import BillNote from './BillNote';

export type QuickSaleCartItem = {
  key: string;
  quickProductId?: string;
  productId?: string;
  productCode?: string;
  typeCode?: string;
  variantId?: string;
  variantName?: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  catalogUnitPrice?: number;
  v2DocumentSelection?: QuickSaleV2DocumentSelection;
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
  billNote: string;
  onBillNoteChange: (value: string) => void;
  onClose?: () => void;
  canOverridePrice: boolean;
  onEditItem?: (item: QuickSaleCartItem) => void;
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
    <Stack direction="row" alignItems="center" sx={{ height: 36, border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden', bgcolor: '#F8FAFC', flexShrink: 0 }}>
      <IconButton
        disabled={item.quantity <= 1}
        aria-label={`ลดจำนวน ${item.productName}`}
        onClick={() => onChange(Math.max(1, item.quantity - 1))}
        sx={{ borderRadius: 0, width: 34, height: 36, color: '#475569' }}>
        <RemoveRoundedIcon fontSize="small" />
      </IconButton>
      <TextField
        variant="standard"
        type="number"
        value={item.quantity}
        inputProps={{ min: 1, 'aria-label': `จำนวน ${item.productName}` }}
        onChange={event => onChange(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
        InputProps={{ disableUnderline: true }}
        sx={{
          width: 42,
          '& input': {
            textAlign: 'center',
            p: 0,
            fontSize: 14,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            MozAppearance: 'textfield',
            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': { WebkitAppearance: 'none', m: 0 },
          },
        }}
      />
      <IconButton aria-label={`เพิ่มจำนวน ${item.productName}`} onClick={() => onChange(item.quantity + 1)} sx={{ borderRadius: 0, width: 34, height: 36, color: '#1463E9' }}>
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
        sx={{
          minHeight: 30,
          px: 0.25,
          borderRadius: 1.5,
          color: '#52657C',
          fontSize: 12.5,
          fontWeight: 600,
          textTransform: 'none',
          justifyContent: 'flex-start',
          '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
        }}>
        <Box component="span" sx={{ fontWeight: 800, color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
          ฿{money.format(item.unitPrice)}
        </Box>
        &nbsp;/ หน่วย
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
            <Typography fontSize={14} fontWeight={800} color="#172033">
              แก้ไขราคาต่อหน่วย
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.productName}
            </Typography>
          </Box>
          <TextField
            autoFocus
            fullWidth
            type="number"
            value={draft}
            inputProps={{ min: 0, step: 0.01, inputMode: 'decimal', 'aria-label': `ราคา/หน่วย ${item.productName}` }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography fontSize={19} fontWeight={900}>
                    ฿
                  </Typography>
                </InputAdornment>
              ),
            }}
            onChange={event => setDraft(event.target.value)}
            onFocus={event => event.target.select()}
            onKeyDown={event => {
              if (event.key === 'Enter') commit();
              if (event.key === 'Escape') cancel();
            }}
            sx={{ '& .MuiOutlinedInput-root': { height: 52, borderRadius: 2.5 }, '& input': { fontSize: 20, fontWeight: 900, fontVariantNumeric: 'tabular-nums' } }}
          />
          <Stack direction="row" gap={1}>
            <Button fullWidth color="inherit" variant="outlined" onClick={cancel} sx={{ minHeight: 40, borderRadius: 2.25, borderColor: '#D8E1EC' }}>
              ยกเลิก
            </Button>
            <Button fullWidth variant="contained" startIcon={<CheckRoundedIcon />} onClick={commit} sx={{ minHeight: 40, borderRadius: 2.25, fontWeight: 800 }}>
              บันทึก
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}

function CartItemRow({
  item,
  onUpdate,
  onRemove,
  canOverridePrice,
  onEdit,
}: Readonly<{ item: QuickSaleCartItem; onUpdate: (values: Partial<QuickSaleCartItem>) => void; onRemove: () => void; canOverridePrice: boolean; onEdit?: () => void }>) {
  const visual = getItemVisual(item);
  return (
    <Box
      component="li"
      sx={{ p: 1.5, listStyle: 'none', border: '1px solid #E8EDF4', borderRadius: 3, bgcolor: '#FFFFFF', boxShadow: '0 2px 4px rgba(15,23,42,.02)', '&:hover': { borderColor: '#C7D7F0' } }}>
      <Stack direction="row" alignItems="flex-start" gap={1.25}>
        <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: visual.background, color: visual.color }}>
          <visual.Icon sx={{ fontSize: 21 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontSize={14} fontWeight={700} color="#172033" lineHeight={1.5} sx={{ overflowWrap: 'anywhere' }}>
            {item.productName}
          </Typography>
          {item.variantName && !isDefaultVariantName(item.variantName) ? (
            <Typography fontSize={11} color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {item.variantName}
            </Typography>
          ) : null}
          {canOverridePrice ? (
            <PriceEditor item={item} onCommit={unitPrice => onUpdate({ unitPrice })} />
          ) : (
            <Tooltip title="การแก้ไขราคาต้องใช้สิทธิ์ผู้จัดการหรือผู้ดูแลระบบ">
              <Typography component="span" sx={{ display: 'inline-block', minHeight: 30, pt: 0.65, color: '#52657C', fontSize: 12.5, fontWeight: 600 }}>
                <Box component="span" sx={{ fontWeight: 800, color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
                  ฿{money.format(item.unitPrice)}
                </Box>
                &nbsp;/ หน่วย
              </Typography>
            </Tooltip>
          )}
        </Box>
        <Stack direction="row" sx={{ flexShrink: 0, mr: -0.5, mt: -0.5 }}>
          {onEdit ? (
            <Tooltip title="แก้ไขตัวเลือก">
              <IconButton aria-label={`แก้ไข ${item.productName}`} onClick={onEdit} sx={{ width: 28, height: 28, color: '#64748B', '&:hover': { color: '#1463E9', bgcolor: '#EFF6FF' } }}>
                <EditRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="ลบรายการ">
            <IconButton aria-label={`ลบ ${item.productName}`} onClick={onRemove} sx={{ width: 28, height: 28, color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
        <QuantityControl item={item} onChange={quantity => onUpdate({ quantity })} />
        <Typography fontSize={16} fontWeight={800} color="#0F172A" sx={{ ml: 'auto', textAlign: 'right', overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}>
          ฿{money.format(roundMoney(item.quantity * item.unitPrice))}
        </Typography>
      </Stack>
    </Box>
  );
}

function DiscountControl({
  value,
  mode,
  appliedDiscount,
  onApplyMode,
  onApplyValue,
}: Readonly<{ value: number; mode: DiscountMode; appliedDiscount: number; onApplyMode: (mode: DiscountMode) => void; onApplyValue: (value: number) => void }>) {
  const [open, setOpen] = React.useState(false);
  const [draftMode, setDraftMode] = React.useState<DiscountMode>(mode);
  const [draftValue, setDraftValue] = React.useState(String(value));
  const editorId = React.useId();
  const inputId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const closeEditor = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openEditor = () => {
    setDraftMode(mode);
    setDraftValue(String(value));
    setOpen(true);
  };
  const apply = () => {
    onApplyMode(draftMode);
    onApplyValue(Math.max(0, Number(draftValue) || 0));
    closeEditor();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography color="#64748B" fontSize={14}>
            ส่วนลด
          </Typography>
          <Button
            ref={triggerRef}
            size="small"
            variant="text"
            aria-expanded={open}
            aria-controls={open ? editorId : undefined}
            startIcon={appliedDiscount > 0 ? <EditRoundedIcon /> : <AddRoundedIcon />}
            onClick={open ? closeEditor : openEditor}
            sx={{ minHeight: 28, px: 0.5, fontSize: 12, fontWeight: 700 }}>
            {appliedDiscount > 0 ? 'แก้ไข' : 'เพิ่มส่วนลด'}
          </Button>
        </Stack>
        <Typography color={appliedDiscount > 0 ? '#15803D' : '#94A3B8'} fontSize={13} fontWeight={600}>
          {appliedDiscount > 0 ? '-' : ''}฿{money.format(appliedDiscount)}
        </Typography>
      </Stack>
      {open && (
        <Stack
          id={editorId}
          gap={1.25}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closeEditor();
            }
          }}
          sx={{ mt: 1.25, p: 1.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
            <Typography component="label" htmlFor={inputId} fontSize={12} fontWeight={600} color="#64748B">
              {draftMode === 'amount' ? 'จำนวนส่วนลด' : 'อัตราส่วนลด'}
            </Typography>
            <Stack direction="row" role="group" aria-label="รูปแบบส่วนลด" gap={0.5} sx={{ p: 0.5, bgcolor: '#F1F5F9', borderRadius: 2.25, flexShrink: 0 }}>
              {(['amount', 'percent'] as const).map(option => (
                <Button
                  key={option}
                  size="small"
                  aria-label={option === 'amount' ? 'ส่วนลดแบบจำนวนเงิน' : 'ส่วนลดแบบเปอร์เซ็นต์'}
                  aria-pressed={draftMode === option}
                  onClick={() => setDraftMode(option)}
                  sx={{
                    minWidth: 54,
                    minHeight: 32,
                    px: 1,
                    borderRadius: 1.75,
                    fontSize: 12,
                    fontWeight: 700,
                    color: draftMode === option ? '#1463E9' : '#64748B',
                    bgcolor: draftMode === option ? '#FFFFFF' : 'transparent',
                    boxShadow: draftMode === option ? '0 1px 4px rgba(15,23,42,.1)' : 'none',
                    '&:hover': { bgcolor: draftMode === option ? '#FFFFFF' : '#E2E8F0' },
                  }}>
                  {option === 'amount' ? '฿ บาท' : '%'}
                </Button>
              ))}
            </Stack>
          </Stack>
          <TextField
            id={inputId}
            autoFocus
            fullWidth
            size="small"
            type="number"
            value={draftValue}
            inputProps={{ min: 0, inputMode: 'decimal', 'aria-label': draftMode === 'amount' ? 'ส่วนลดเป็นบาท' : 'ส่วนลดเป็นเปอร์เซ็นต์' }}
            InputProps={{ endAdornment: <InputAdornment position="end">{draftMode === 'amount' ? 'บาท' : '%'}</InputAdornment> }}
            onChange={event => setDraftValue(event.target.value)}
            onFocus={event => event.target.select()}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': { height: 48, borderRadius: 2.25, bgcolor: '#F8FAFC' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '& input': {
                fontSize: 22,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                MozAppearance: 'textfield',
                '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': { WebkitAppearance: 'none', m: 0 },
              },
            }}
          />
          <Stack direction="row" justifyContent="flex-end" gap={1}>
            <Button size="small" onClick={closeEditor} sx={{ minHeight: 36, px: 1.5, borderRadius: 2, color: '#64748B' }}>
              ยกเลิก
            </Button>
            <Button size="small" variant="contained" disableElevation startIcon={<CheckRoundedIcon />} onClick={apply} sx={{ minHeight: 36, px: 1.5, borderRadius: 2, fontWeight: 700 }}>
              ใช้ส่วนลด
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

export default function QuickSellerCart({
  items,
  setItems,
  totals,
  discountValue,
  discountMode,
  setDiscountValue,
  setDiscountMode,
  onCheckout,
  billNote,
  onBillNoteChange,
  onClose,
  canOverridePrice,
  onEditItem,
}: QuickSellerCartProps) {
  const updateItem = (key: string, values: Partial<QuickSaleCartItem>) => {
    setItems(previous => previous.map(item => (item.key === key ? { ...item, ...values } : item)));
  };

  return (
    <Stack sx={{ height: '100%', minHeight: 0, minWidth: 0, width: '100%', bgcolor: '#FFFFFF' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 2, flexShrink: 0, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 2.5, bgcolor: '#EEF4FF', color: '#1463E9' }}>
            <ShoppingCartRoundedIcon sx={{ fontSize: 21 }} />
          </Box>
          <Box>
            <Typography component="h2" fontSize={18} fontWeight={800} color="#0F172A">
              Cart
            </Typography>
            <Typography fontSize={12} color="text.secondary" aria-live="polite">
              {items.length} รายการ · {items.reduce((count, item) => count + item.quantity, 0).toLocaleString('th-TH')} หน่วย
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Tooltip title="ล้างรายการทั้งหมด">
            <span>
              <IconButton
                disabled={!items.length}
                aria-label="ล้างรายการทั้งหมด"
                onClick={() => {
                  setItems([]);
                  onBillNoteChange('');
                }}
                sx={{ width: 34, height: 34, border: '1px solid #E8EDF4', borderRadius: 2, color: '#64748B', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
                <DeleteSweepRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {onClose ? (
            <IconButton aria-label="ปิดตะกร้า" onClick={onClose} size="small" sx={{ width: 34, height: 34 }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', p: 1.5, bgcolor: '#F5F7FB', scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 transparent' }}>
        {items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" textAlign="center" sx={{ minHeight: 190, height: '100%', px: 2, color: 'text.secondary' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                mb: 2,
                borderRadius: 5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: '#FFFFFF',
                color: '#94A3B8',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(15,23,42,.04)',
                transform: 'rotate(-6deg)',
              }}>
              <ShoppingCartRoundedIcon sx={{ fontSize: 32, transform: 'rotate(6deg)' }} />
            </Box>
            <Typography fontWeight={700} color="#334155">
              เริ่มบิลใหม่ได้เลย
            </Typography>
            <Typography fontSize={13} sx={{ mt: 0.75, maxWidth: 230, lineHeight: 1.7 }}>
              เลือกสินค้าจากเมนู รายการที่เลือกจะแสดงที่นี่
            </Typography>
          </Stack>
        ) : (
          <Stack component="ul" aria-label="รายการในตะกร้า" gap={1} sx={{ m: 0, p: 0 }}>
            {items.map(item => (
              <CartItemRow
                key={item.key}
                item={item}
                onUpdate={values => updateItem(item.key, values)}
                onRemove={() => {
                  setItems(previous => previous.filter(row => row.key !== item.key));
                  if (items.length === 1) onBillNoteChange('');
                }}
                canOverridePrice={canOverridePrice}
                onEdit={item.v2DocumentSelection && onEditItem ? () => onEditItem(item) : undefined}
              />
            ))}
          </Stack>
        )}
        {items.length > 0 ? <BillNote value={billNote} onChange={onBillNoteChange} /> : null}
      </Box>

      <Divider />
      <Stack
        gap={1.2}
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: { xs: 1.35, sm: 2 },
          pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', sm: 2 },
          flexShrink: 0,
          maxHeight: '60%',
          overflowY: 'auto',
          bgcolor: '#FFFFFF',
          boxShadow: '0 -6px 20px rgba(15, 23, 42, 0.04)',
        }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="#64748B" fontSize={13}>
            ยอดรวมก่อนส่วนลด
          </Typography>
          <Typography fontSize={13} fontWeight={700}>
            ฿{money.format(totals.subtotal)}
          </Typography>
        </Stack>
        <DiscountControl value={discountValue} mode={discountMode} appliedDiscount={totals.discount} onApplyMode={setDiscountMode} onApplyValue={setDiscountValue} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ pt: 1.5, borderTop: '1px dashed #D8E1EC', flexWrap: 'wrap' }}>
          <Box>
            <Typography fontSize={14} fontWeight={800} color="#25324A">
              ยอดสุทธิ
            </Typography>
            <Typography fontSize={11} color="text.secondary">
              ก่อน VAT (ถ้ามี)
            </Typography>
          </Box>
          <Typography fontSize={{ xs: 27, md: 30 }} color={items.length ? '#0F172A' : '#94A3B8'} fontWeight={800} sx={{ overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}>
            ฿{money.format(totals.grandTotal)}
          </Typography>
        </Stack>
        <Button
          fullWidth
          variant="contained"
          disabled={!items.length}
          onClick={onCheckout}
          sx={{ minHeight: 52, flexShrink: 0, borderRadius: 2.5, px: 2, bgcolor: '#1463E9', boxShadow: items.length ? '0 6px 16px rgba(20,99,233,.18)' : 'none', '&:hover': { bgcolor: '#0F56CF' } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography fontSize={16} fontWeight={800}>
                ชำระเงิน
              </Typography>
              <Box
                component="kbd"
                sx={{ display: { xs: 'none', md: 'inline-block' }, px: 0.65, py: 0.15, border: '1px solid currentColor', borderRadius: 1, fontFamily: 'inherit', fontSize: 10, opacity: 0.7 }}>
                F9
              </Box>
            </Stack>
            <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
          </Stack>
        </Button>
      </Stack>
    </Stack>
  );
}
