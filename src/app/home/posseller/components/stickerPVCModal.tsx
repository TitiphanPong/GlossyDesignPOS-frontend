'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Box,
  Card,
  TextField,
  Divider,
  FormControlLabel,
  RadioGroup,
  Radio,
  CardContent,
  IconButton,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types/cart';
import Delete from '@mui/icons-material/Delete';
import { formatMoneySummary, posSellerLocale } from '../locales/th';

interface StickerPVCModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: Partial<CartItem>;
}

interface SizeItem {
  height: string;
  width: string;
}

export default function StickerPVCModal({ open, onClose, onSelect, productName, initialData }: Readonly<StickerPVCModalProps>) {
  const [stickerPVCType, setStickerPVCType] = useState('');
  const [productNote, setProductNote] = useState('');
  const [sizeFlex, setSizeFlex] = useState<SizeItem[]>([{ height: '', width: '' }]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [fullPayment, setFullPayment] = useState(false);

  const remaining = Math.max(total - deposit, 0);

  const handleChange = (index: number, field: 'height' | 'width', value: string) => {
    const newsize = [...sizeFlex];
    newsize[index][field] = value;
    setSizeFlex(newsize);
  };

  const addCard = () => {
    setSizeFlex([...sizeFlex, { height: '', width: '' }]);
  };

  const removeCard = (index: number) => {
    const newsize = sizeFlex.filter((_, i) => i !== index);
    setSizeFlex(newsize);
  };

  useEffect(() => {
    if (initialData) {
      setStickerPVCType(initialData.stickerPVCType || '');
      setProductNote(initialData.productNote || '');
      if (initialData.sizeFlex && Array.isArray(initialData.sizeFlex)) {
        setSizeFlex(initialData.sizeFlex);
      } else {
        setSizeFlex([{ height: '', width: '' }]);
      }
      setPrice(initialData.unitPrice || 0);
      setQuantity(initialData.qty || 1);
      setTotal(initialData.totalPrice || 0);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
    } else {
      setStickerPVCType('');
      setProductNote('');
      setSizeFlex([{ height: '', width: '' }]);
      setPrice(0);
      setQuantity(1);
      setTotal(0);
      setDeposit(0);
      setFullPayment(false);
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
          {posSellerLocale.stickerPVC.sizeCardsTitle}
        </Typography>
        <DialogContent>
          <Stack
            direction="row"
            spacing={0}
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
            alignItems="flex-start"
          >
            {sizeFlex.map((item, index) => (
              <Card
                key={`${item.width}-${item.height}`}
                sx={{
                  width: 200,
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'stretch',
                  position: 'relative',
                }}>
                <Typography fontWeight={600}>{index + 1}.</Typography>
                <TextField label={posSellerLocale.common.heightMillimeters} value={item.height} onChange={e => handleChange(index, 'height', e.target.value)} fullWidth />
                <TextField label={posSellerLocale.common.widthMillimeters} value={item.width} onChange={e => handleChange(index, 'width', e.target.value)} fullWidth />
                {sizeFlex.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => removeCard(index)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Delete />
                  </IconButton>
                )}
              </Card>
            ))}
            <Card
              onClick={addCard}
              sx={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed #ccc',
                color: '#777',
                borderRadius: 2,
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}>
              <Stack alignItems="center">
                <Typography>{posSellerLocale.stickerPVC.addSize}</Typography>
              </Stack>
            </Card>
          </Stack>
        </DialogContent>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.kindTitle}
        </Typography>

        <RadioGroup row value={stickerPVCType} onChange={e => setStickerPVCType(e.target.value)} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel value="w.pvc-matte-st" control={<Radio />} label={posSellerLocale.stickerPVC.types['w.pvc-matte-st']} />
            <FormControlLabel value="w.pvc-gloss-st" control={<Radio />} label={posSellerLocale.stickerPVC.types['w.pvc-gloss-st']} />
            <FormControlLabel value="clear-gloss-st" control={<Radio />} label={posSellerLocale.stickerPVC.types['clear-gloss-st']} />
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControlLabel value="clear-matte-st" control={<Radio />} label={posSellerLocale.stickerPVC.types['clear-matte-st']} />
            <FormControlLabel value="pp-sticker" control={<Radio />} label={posSellerLocale.stickerPVC.types['pp-sticker']} />
          </Stack>
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.stickerPVC.quantityAndPriceTitle}
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              {posSellerLocale.common.quantityLabel} ({posSellerLocale.common.pieces}) :
            </Typography>
            <TextField type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} sx={{ width: 120 }} slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }} />
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              {posSellerLocale.common.totalLabel} :
            </Typography>
            <TextField
              type="number"
              label={posSellerLocale.common.totalLabel}
              value={total}
              onChange={e => setTotal(Number(e.target.value) || 0)}
              sx={{ width: 150 }}
              slotProps={{ input: {
                endAdornment: '฿',
} }}
            />
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {posSellerLocale.common.detailsTitle}
        </Typography>
        <TextField label={posSellerLocale.common.detailsField} value={productNote} onChange={e => setProductNote(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <Divider sx={{ my: 2 }} />

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
                    value={total}
                    fullWidth
                    onChange={e => {
                      if (!fullPayment) {
                        setTotal(Number(e.target.value) || 0);
                      }
                    }}
                    disabled={fullPayment}
                    slotProps={{ input: {
                      endAdornment: '฿',
} }}
                  />
                  <TextField
                    label={posSellerLocale.common.depositLabel}
                    type="number"
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
                    value={total}
                    fullWidth
                    onChange={e => {
                      if (fullPayment) {
                        setTotal(Number(e.target.value) || 0);
                      }
                    }}
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
              category: posSellerLocale.stickerPVC.category,
              stickerPVCType,
              sizeFlex,
              productNote,
              qty: quantity,
              unitPrice: quantity > 0 ? total / quantity : total,
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







