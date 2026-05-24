'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CartItem } from '../types/cart';
import { formatMoneySummary, posSellerLocale } from '../locales/th';
import PosPaymentSummaryFields from './PosPaymentSummaryFields';

interface VariantOption {
  name: string;
  width: number;
  height: number;
  custom?: boolean;
}

interface PlotPlanModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: Partial<CartItem>;
}

const variantList: VariantOption[] = [
  { name: 'A2', width: 420, height: 594 },
  { name: 'A1', width: 594, height: 841 },
  { name: 'A0', width: 841, height: 1189 },
  { name: 'Custom Size', width: 0, height: 0, custom: true },
];

export default function PlotPlanModal({ open, onClose, onSelect, productName, initialData }: Readonly<PlotPlanModalProps>) {
  const [selected, setSelected] = useState<VariantOption | null>(null);
  const [material, setMaterial] = useState('bond-80g');
  const [quantity, setQuantity] = useState(1);
  const [productNote, setProductNote] = useState('');
  const [colorMode, setColorMode] = useState('bw');
  const [total, setTotal] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [fullPayment, setFullPayment] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);

  const remaining = Math.max(total - deposit, 0);

  useEffect(() => {
    if (initialData) {
      setQuantity(initialData.qty || 1);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
      setMaterial(initialData.material || 'bond-80g');
      setColorMode(initialData.colorMode || 'bw');
      setProductNote(initialData.productNote || '');
      setTotal(initialData.totalPrice ?? 0);
      if (initialData.variant) {
        setSelected(initialData.variant);
        setCustomWidth(Number(initialData.variant.width) || 0);
        setCustomHeight(Number(initialData.variant.height) || 0);
      }
    } else {
      setSelected(null);
      setMaterial('bond-80g');
      setQuantity(1);
      setProductNote('');
      setColorMode('bw');
      setTotal(0);
      setDeposit(0);
      setFullPayment(false);
      setCustomWidth(0);
      setCustomHeight(0);
    }
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{productName}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={0} justifyContent="center" mb={3} flexWrap="wrap" sx={{ gap: 2 }}>
          {variantList.map((v) => {
            const isSelected = selected?.name === v.name;
            const isCustom = v.custom;
            return (
              <Card
                key={v.name}
                onClick={() => setSelected(v)}
                sx={{
                  height: 260,
                  flex: {
                    xs: '0 0 100%',
                    sm: '0 0 48%',
                    md: '0 0 23%',
                  },
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
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

                      if (aspectRatio > 1) previewH = maxSize / aspectRatio;
                      else previewW = maxSize * aspectRatio;

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
                      {posSellerLocale.common.customSizeMillimeters}
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
                  <Box sx={{ textAlign: 'center', mt: 0 }}>
                    <Typography variant="body1" color="text.secondary">
                      {v.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mt={1}>
                      {v.width} × {v.height} {posSellerLocale.plotPlan.sizeUnit}
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

        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
              {posSellerLocale.plotPlan.colorModeLabel}
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
          {posSellerLocale.common.paperTypeTitle}
        </Typography>
        <RadioGroup row value={material} onChange={e => setMaterial(e.target.value)} sx={{ justifyContent: 'center', gap: 3 }}>
          <FormControlLabel value="bond-80g" control={<Radio />} label={posSellerLocale.plotPlan.materials['bond-80g']} />
          <FormControlLabel value="bond-100g" control={<Radio />} label={posSellerLocale.plotPlan.materials['bond-100g']} />
          <FormControlLabel value="tracing-paper" control={<Radio />} label={posSellerLocale.plotPlan.materials['tracing-paper']} />
          <FormControlLabel value="photo-paper" control={<Radio />} label={posSellerLocale.plotPlan.materials['photo-paper']} />
          <FormControlLabel value="other" control={<Radio />} label={posSellerLocale.plotPlan.materials.other} />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {posSellerLocale.common.priceSummaryTitle}
          </Typography>
          <PosPaymentSummaryFields
            fullPayment={fullPayment}
            total={total}
            deposit={deposit}
            remaining={remaining}
            onFullPaymentChange={setFullPayment}
            onTotalChange={setTotal}
            onDepositChange={value => setDeposit(Math.min(Math.max(value, 0), total))}
            allowDepositTotalEdit
            allowFullAmountEdit
          />
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
              category: posSellerLocale.plotPlan.category,
              variant: {
                ...selected,
                width: selected.custom ? customWidth : selected.width,
                height: selected.custom ? customHeight : selected.height,
              },
              productNote,
              material,
              colorMode,
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
