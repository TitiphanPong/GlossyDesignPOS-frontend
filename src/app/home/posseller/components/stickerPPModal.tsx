'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider } from '@mui/material';
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

interface StickerPPModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: any;
}

const variantList: VariantOption[] = [
  { name: posSellerLocale.stickerPP.variants.A4, width: 210, height: 297 },
  { name: posSellerLocale.stickerPP.variants.A3, width: 297, height: 420 },
  { name: posSellerLocale.stickerPP.variants.squareSheet, width: 0, height: 0 },
];

export default function StickerPPModal({ open, onClose, onSelect, productName, initialData }: Readonly<StickerPPModalProps>) {
  const [selected, setSelected] = useState<VariantOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [productNote, setProductNote] = useState('');
  const [colorMode, setColorMode] = useState('bw');
  const [total, setTotal] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [fullPayment, setFullPayment] = useState<boolean>(false);

  const remaining = Math.max(total - deposit, 0);

  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setQuantity(initialData.qty || 1);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
      setColorMode(initialData.colorMode || 'bw');
      setTotal(initialData.total ?? initialData.totalPrice ?? 0);
      if (initialData.variant) setSelected(initialData.variant);
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
                    sm: '0 0 50%',
                    md: '0 0 28%',
                  },
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,

                  cursor: 'pointer',
                  position: 'relative',
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
                      {v.width} × {v.height} {posSellerLocale.stickerPP.sizeUnit}
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
          {posSellerLocale.stickerPP.quantityAndPriceTitle}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={3}
            sx={{
              mt: 2,
              flexWrap: 'wrap',
            }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {posSellerLocale.common.pieces}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: '#ccc' }} />

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {posSellerLocale.stickerPP.priceOnlyLabel}
              </Typography>
              <TextField type="text" value={total} onChange={e => setTotal(Number(e.target.value) || 0)} sx={{ width: 100 }} slotProps={{ htmlInput: { style: { textAlign: 'center' } } }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {posSellerLocale.common.baht}
              </Typography>
            </Box>
          </Box>
        </Stack>

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
              category: posSellerLocale.stickerPP.category,
              variant: {
                ...selected,
                width: customWidth,
                height: customHeight,
              },
              productNote,
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





