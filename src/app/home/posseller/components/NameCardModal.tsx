'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider, FormControlLabel, RadioGroup, Radio, CardContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CartItem } from '../types/cart';
import { formatMoneySummary, posSellerLocale } from '../locales/th';

interface VariantOption {
  name: string;
  width: number;
  height: number;
  paperKind: string;
  custom?: boolean;
}

interface NameCardModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: any;
}

const variantList: VariantOption[] = [
  { name: '90 × 55 mm / MATTE', width: 90, height: 55, paperKind: 'MATTE' },
  { name: '90 × 55 mm / GLOSS', width: 90, height: 55, paperKind: 'GLOSS' },
  { name: '90 × 55 mm / PVC', width: 90, height: 55, paperKind: 'PVC' },
  { name: 'Custom Size', width: 0, height: 0, paperKind: 'CUSTOM', custom: true },
];

export default function NameCardModal({ open, onClose, onSelect, productName, initialData }: Readonly<NameCardModalProps>) {
  const [selected, setSelected] = useState<VariantOption | null>(null);
  const [sides, setSides] = useState<'1' | '2'>('1');
  const [material, setMaterial] = useState('other');
  const [quantity, setQuantity] = useState(100);
  const [productNote, setProductNote] = useState('');
  const [colorMode, setColorMode] = useState('bw');
  const [total, setTotal] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [fullPayment, setFullPayment] = useState<boolean>(false);

  const remaining = Math.max(total - deposit, 0);

  const [customWidth, setCustomWidth] = useState<number>(90);
  const [customHeight, setCustomHeight] = useState<number>(55);

  useEffect(() => {
    if (initialData) {
      setQuantity(initialData.qty || 100);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
      setMaterial(initialData.material || '');
      setSides(initialData.sides || '2');
      setColorMode(initialData.colorMode || 'color');
      setTotal(initialData.total ?? initialData.totalPrice ?? 0);
      if (initialData.variant) setSelected(initialData.variant);
    }
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{productName}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={3} justifyContent="center" mb={3}>
          {variantList.map((v) => {
            const isSelected = selected?.name === v.name;
            const isCustom = v.custom;
            return (
              <Card
                key={v.name}
                onClick={() => setSelected(v)}
                sx={{
                  width: 200,
                  height: 260,
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: '0.25s',
                  backgroundColor: isSelected ? '#E3F2FD' : 'white',
                  boxShadow: isSelected ? '0 6px 20px rgba(25,118,210,0.2)' : '0 3px 10px rgba(0,0,0,0.05)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)' },
                }}>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                  {isCustom ? (
                    (() => {
                      const maxSize = 80;
                      const aspectRatio = customWidth && customHeight ? customWidth / customHeight : 1;

                      let previewW = maxSize;
                      let previewH = maxSize;

                      if (aspectRatio > 1) {
                        previewH = maxSize / aspectRatio;
                      } else {
                        previewW = maxSize * aspectRatio;
                      }

                      return (
                        <Box
                          sx={{
                            width: previewW,
                            height: previewH,
                            border: '2px solid #333',
                            borderRadius: 1,
                            backgroundColor: '#fafafa',
                          }}
                        />
                      );
                    })()
                  ) : (
                    <Box
                      sx={{
                        width: v.width > v.height ? '70%' : '40%',
                        height: v.height > v.width ? '70%' : '40%',
                        border: '2px solid #333',
                        borderRadius: 1,
                        backgroundColor: '#fafafa',
                      }}
                    />
                  )}
                </Box>

                {isCustom ? (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {posSellerLocale.nameCard.customSize}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <TextField
                        size="small"
                        type="text"
                        label="W"
                        value={customWidth}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCustomWidth(val === '' ? 0 : Number.parseInt(val, 10));
                        }}
                        sx={{ width: 70 }}
                        slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
                      />
                      <TextField
                        size="small"
                        type="text"
                        label="H"
                        value={customHeight}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCustomHeight(val === '' ? 0 : Number.parseInt(val, 10));
                        }}
                        sx={{ width: 70 }}
                        slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
                      />
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {v.width} × {v.height} {posSellerLocale.nameCard.sizeUnit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {posSellerLocale.common.paperPrefix} / {posSellerLocale.nameCard.paperKinds[v.paperKind as keyof typeof posSellerLocale.nameCard.paperKinds]}
                    </Typography>
                  </Box>
                )}
              </Card>
            );
          })}
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.detailsTitle}
        </Typography>

        <TextField label={posSellerLocale.common.detailsField} value={productNote} onChange={e => setProductNote(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.optionsTitle}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
              {posSellerLocale.documentPrint.printSidesLabel}
            </Typography>
            <RadioGroup row value={sides} onChange={e => setSides(e.target.value as '1' | '2')}>
              <FormControlLabel value="1" control={<Radio />} label={posSellerLocale.common.oneSide} />
              <FormControlLabel value="2" control={<Radio />} label={posSellerLocale.common.twoSides} />
            </RadioGroup>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
              {posSellerLocale.documentPrint.colorModeLabel}
            </Typography>
            <RadioGroup row value={colorMode} onChange={e => setColorMode(e.target.value)}>
              <FormControlLabel value="bw" control={<Radio />} label={posSellerLocale.common.blackAndWhite} />
              <FormControlLabel value="color" control={<Radio />} label={posSellerLocale.common.color} />
            </RadioGroup>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
              {posSellerLocale.common.quantityProductLabel}
            </Typography>
            <TextField
              type="text"
              value={quantity}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setQuantity(val === '' ? 0 : Number.parseInt(val, 10));
              }}
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
            />
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 600, ml: 1 }}>
              {posSellerLocale.common.pieces}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.materialTitle}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <RadioGroup
            row
            value={material}
            onChange={e => setMaterial(e.target.value)}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
            }}>
            <FormControlLabel value="150g" control={<Radio />} label={posSellerLocale.nameCard.materials['150g']} />
            <FormControlLabel value="160g" control={<Radio />} label={posSellerLocale.nameCard.materials['160g']} />
            <FormControlLabel value="260g" control={<Radio />} label={posSellerLocale.nameCard.materials['260g']} />
            <FormControlLabel value="300g" control={<Radio />} label={posSellerLocale.nameCard.materials['300g']} />
            <FormControlLabel value="200MC" control={<Radio />} label={posSellerLocale.nameCard.materials['200MC']} />
            <FormControlLabel value="220MC" control={<Radio />} label={posSellerLocale.nameCard.materials['220MC']} />
            <FormControlLabel value="other" control={<Radio />} label={posSellerLocale.nameCard.materials.other} />
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {posSellerLocale.common.priceSummaryTitle}
          </Typography>

          <RadioGroup row value={fullPayment ? 'full' : 'deposit'} onChange={e => setFullPayment(e.target.value === 'full')} sx={{ width: '100%' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch" flexWrap="wrap" sx={{ width: '100%' }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  minWidth: 280,
                  borderColor: fullPayment ? 'grey.300' : 'primary.main',
                }}>
                <CardContent>
                  <FormControlLabel
                    value="deposit"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {posSellerLocale.common.depositProduct}
                      </Typography>
                    }
                  />
                  <Stack spacing={2} mt={2}>
                    <TextField
                      label={posSellerLocale.common.totalLabel}
                      type="text"
                      value={total}
                      onChange={e => setTotal(Number(e.target.value) || 0)}
                      fullWidth
                      disabled={fullPayment}
                      slotProps={{ input: {
                        endAdornment: '฿',
} }}
                    />
                    <TextField
                      label={posSellerLocale.common.depositLabel}
                      type="text"
                      value={deposit}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setDeposit(Math.min(Math.max(val, 0), total));
                      }}
                      fullWidth
                      disabled={fullPayment}
                      slotProps={{ input: {
                        endAdornment: '฿',
} }}
                    />
                    <TextField
                      label={posSellerLocale.common.remainingLabel}
                      type="text"
                      value={remaining}
                      fullWidth
                      disabled
                      slotProps={{ input: {
                        endAdornment: '฿',
} }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  minWidth: 280,
                  borderColor: fullPayment ? 'primary.main' : 'grey.300',
                }}>
                <CardContent>
                  <FormControlLabel
                    value="full"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {posSellerLocale.common.fullPaymentLabel}
                      </Typography>
                    }
                  />
                  <Stack spacing={2} mt={2}>
                    <TextField
                      label={posSellerLocale.common.amountLabel}
                      type="text"
                      value={total}
                      onChange={e => setTotal(Number(e.target.value) || 0)}
                      fullWidth
                      disabled={!fullPayment}
                      slotProps={{ input: {
                        endAdornment: '฿',
} }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </RadioGroup>
        </Box>
      </DialogContent>
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="h6" sx={{ color: 'green', fontWeight: 700, px: 3 }}>
          {formatMoneySummary(fullPayment ? 'full' : 'deposit', fullPayment ? total : deposit)}
        </Typography>
      </Box>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>{posSellerLocale.common.cancel}</Button>
        <Button
          variant="contained"
          size="large"
          disabled={!selected}
          onClick={() =>
            selected &&
            onSelect({
              key: '',
              name: productName,
              category: posSellerLocale.nameCard.category,
              variant: {
                ...selected,
                width: customWidth,
                height: customHeight,
              },
              productNote,
              sides,
              colorMode,
              material,
              qty: quantity,
              unitPrice: total / (quantity || 1),
              totalPrice: total,
              deposit: fullPayment ? total : deposit,
              remaining: fullPayment ? 0 : remaining,
              fullPayment,
            })
          }>
          {posSellerLocale.common.next}
        </Button>
      </DialogActions>
    </Dialog>
  );
}








