'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types/cart';
import { formatMoneySummary, posSellerLocale } from '../locales/th';
import PosPaymentSummaryFields from './PosPaymentSummaryFields';

type PremiumType = 'roundpin' | 'shirt-screen' | 'coffee-mug' | 'acrylic-sign';

interface PremiumProductProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: Partial<CartItem>;
}

export default function PremiumProductModal({ open, onClose, onSelect, productName, initialData }: Readonly<PremiumProductProps>) {
  const [typePremium, setTypePremium] = useState<PremiumType>('roundpin');
  const [productNote, setProductNote] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [fullPayment, setFullPayment] = useState(false);

  const typeOptions: Array<{ value: PremiumType; label: string; description: string; img: string }> = [
    { value: 'roundpin', label: posSellerLocale.premiumProduct.types.roundpin.label, description: posSellerLocale.premiumProduct.types.roundpin.description, img: '/assets/productpremium_roundpin.png' },
    { value: 'shirt-screen', label: posSellerLocale.premiumProduct.types['shirt-screen'].label, description: posSellerLocale.premiumProduct.types['shirt-screen'].description, img: '/assets/productpremium_shirtheattransferflex.png' },
    { value: 'coffee-mug', label: posSellerLocale.premiumProduct.types['coffee-mug'].label, description: posSellerLocale.premiumProduct.types['coffee-mug'].description, img: '/assets/productpremium_coffeemug.png' },
    { value: 'acrylic-sign', label: posSellerLocale.premiumProduct.types['acrylic-sign'].label, description: posSellerLocale.premiumProduct.types['acrylic-sign'].description, img: '/assets/productpremium_shirtheattransferflex.png' },
  ];

  const remaining = Math.max(total - deposit, 0);

  useEffect(() => {
    if (initialData) {
      setTypePremium(initialData.typePremium || 'roundpin');
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
        <Stack direction="row" spacing={0} gap={2} justifyContent="center" flexWrap="wrap">
          {typeOptions.map(opt => {
            const isSelected = typePremium === opt.value;
            return (
              <Card
                key={opt.value}
                onClick={() => setTypePremium(opt.value)}
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
              category: posSellerLocale.premiumProduct.category,
              typePremium,
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


