'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types/cart';
import { formatMoneySummary, posSellerLocale } from '../locales/th';
import PosPaymentSummaryFields from './PosPaymentSummaryFields';

interface StampModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: Partial<CartItem>;
}

export default function StampModal({ open, onClose, onSelect, productName, initialData }: Readonly<StampModalProps>) {
  const [type, setType] = useState<'normal' | 'inked'>('normal');
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [productNote, setProductNote] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [fullPayment, setFullPayment] = useState(false);

  const typeOptions = [
    { value: 'normal', label: posSellerLocale.stamp.types.normal.label, description: posSellerLocale.stamp.types.normal.description, img: '/assets/stamp_normal.png' },
    { value: 'inked', label: posSellerLocale.stamp.types.inked.label, description: posSellerLocale.stamp.types.inked.description, img: '/assets/stamp_ink.png' },
  ];

  const shapeOptions = [
    { value: 'circle', label: posSellerLocale.stamp.shapes.circle, preview: 'circle' },
    { value: 'square', label: posSellerLocale.stamp.shapes.square, preview: 'square' },
  ];

  const remaining = Math.max(total - deposit, 0);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'normal');
      setShape(initialData.shape || 'circle');
      setProductNote(initialData.productNote || '');
      setSize(initialData.size || '');
      setPrice(initialData.unitPrice || 0);
      setQuantity(initialData.qty || 1);
      setTotal(initialData.totalPrice || 0);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
    }
  }, [initialData, open]);

  useEffect(() => {
    setTotal(price * quantity);
  }, [price, quantity]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{productName}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.typeTitle}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          {typeOptions.map(opt => {
            const isSelected = type === opt.value;
            return (
              <Card
                key={opt.value}
                onClick={() => setType(opt.value as 'normal' | 'inked')}
                sx={{
                  width: 180,
                  height: 230,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: isSelected ? '#E3F2FD' : 'white',
                  boxShadow: isSelected ? '0 6px 20px rgba(25,118,210,0.2)' : '0 3px 10px rgba(0,0,0,0.05)',
                  transition: '0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 2,
                }}>
                <Box
                  component="img"
                  src={opt.img}
                  alt={opt.label}
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: 'contain',
                    mb: 2,
                  }}
                />
                <Typography fontWeight={600}>{opt.label}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {opt.description}
                </Typography>
              </Card>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.kindTitle}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          {shapeOptions.map(opt => {
            const isSelected = shape === opt.value;
            return (
              <Card
                key={opt.value}
                onClick={() => setShape(opt.value as 'circle' | 'square')}
                sx={{
                  width: 180,
                  height: 180,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: isSelected ? '#E3F2FD' : 'white',
                  boxShadow: isSelected ? '0 6px 20px rgba(25,118,210,0.2)' : '0 3px 10px rgba(0,0,0,0.05)',
                  transition: '0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 2,
                }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    border: '2px solid #333',
                    borderRadius: opt.preview === 'circle' ? '50%' : '8px',
                    backgroundColor: '#fafafa',
                    mb: 2,
                  }}
                />
                <Typography fontWeight={600}>{opt.label}</Typography>
              </Card>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.detailsTitle}
        </Typography>

        <TextField label={posSellerLocale.common.detailsField} value={productNote} onChange={e => setProductNote(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.optionsTitle}
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label={posSellerLocale.common.sizeLabel} value={size} onChange={e => setSize(e.target.value)} fullWidth />
          <TextField label={posSellerLocale.common.priceLabel} type="number" value={price} onChange={e => setPrice(Number(e.target.value) || 0)} fullWidth />
          <TextField label={posSellerLocale.common.quantityLabel} type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} fullWidth />
        </Stack>

        <Divider sx={{ my: 2 }} />

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
        />
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
          onClick={() =>
            onSelect({
              key: '',
              name: productName,
              category: posSellerLocale.stamp.category,
              type,
              shape,
              size,
              productNote,
              qty: quantity,
              unitPrice: price,
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







