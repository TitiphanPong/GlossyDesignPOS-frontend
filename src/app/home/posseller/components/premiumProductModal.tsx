'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider, FormControlLabel, RadioGroup, Radio, CardContent } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types/cart';

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
    { value: 'roundpin', label: 'เข็มกลัด', description: 'ราคาเริ่มต้นที่ ...', img: '/assets/productpremium_roundpin.png' },
    { value: 'shirt-screen', label: 'สกรีนเสื้อ', description: 'ราคาเริ่มต้นที่ ...', img: '/assets/productpremium_shirtheattransferflex.png' },
    { value: 'coffee-mug', label: 'สกรีนแก้ว', description: 'ราคาเริ่มต้นที่ ...', img: '/assets/productpremium_coffeemug.png' },
    { value: 'acrylic-sign', label: 'ป้ายอะคลิลิค', description: 'ราคาเริ่มต้นที่ ...', img: '/assets/productpremium_shirtheattransferflex.png' },
  ];

  const remaining = Math.max(total - deposit, 0);

  useEffect(() => {
    if (initialData) {
      setTypePremium(initialData.typePremium || 'roundpin');
      setProductNote(initialData.productNote || '');
      setSize(initialData.size || '');
      setPrice(initialData.unitPrice || 0); // 👈 แก้จาก price → unitPrice
      setQuantity(initialData.qty || 1); // 👈 แก้จาก quantity → qty
      setTotal(initialData.totalPrice || 0); // 👈 แก้จาก total → totalPrice
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
    }
  }, [initialData, open]);

  // อัปเดตราคาอัตโนมัติ
  useEffect(() => {
    setTotal(price * quantity);
  }, [price, quantity]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>{productName}</DialogTitle>
      <DialogContent dividers>
        {/* ประเภทตรายาง */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ประเภท :
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
                {/* ดึงรูปจาก public/assets */}
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
          รายละเอียดสินค้า :
        </Typography>

        <TextField label="รายละเอียดสินค้า" value={productNote} onChange={e => setProductNote(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Divider sx={{ my: 2 }} />

        {/* ขนาด, ราคา, จำนวน */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ตัวเลือกเพิ่มเติม :
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="ขนาด" value={size} onChange={e => setSize(e.target.value)} fullWidth />
          <TextField label="ราคา" type="number" value={price} onChange={e => setPrice(Number(e.target.value) || 0)} fullWidth />
          <TextField label="จำนวน" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} fullWidth />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* การชำระเงิน */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          สรุปราคา :
        </Typography>
        <RadioGroup row value={fullPayment ? 'full' : 'deposit'} onChange={e => setFullPayment(e.target.value === 'full')} sx={{ width: '100%' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch" flexWrap="wrap" sx={{ width: '100%' }}>
            {/* มัดจำ */}
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
                      มัดจำสินค้า
                    </Typography>
                  }
                />
                <Stack spacing={2} mt={2}>
                  <TextField
                    label="ยอดรวม"
                    value={total}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
                      },
                    }}
                  />
                  <TextField
                    label="ยอดมัดจำ"
                    type="number"
                    value={deposit}
                    onChange={e => {
                      const val = Number(e.target.value) || 0;
                      setDeposit(Math.min(Math.max(val, 0), total));
                    }}
                    fullWidth
                    disabled={fullPayment}
                    slotProps={{
                      input: {
                        endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
                      },
                    }}
                  />
                  <TextField
                    label="คงค้าง"
                    value={remaining}
                    fullWidth
                    disabled
                    slotProps={{
                      input: {
                        endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
                      },
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* เต็มจำนวน */}
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
                      ชำระเต็มจำนวน
                    </Typography>
                  }
                />
                <Stack spacing={2} mt={2}>
                  <TextField
                    label="จำนวนเงิน"
                    value={total}
                    fullWidth
                    disabled
                    slotProps={{
                      input: {
                        endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
                      },
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </RadioGroup>
      </DialogContent>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="h6" sx={{ color: 'green', fontWeight: 700, px: 3 }}>
          {fullPayment ? `ยอดที่ต้องชำระเต็มจำนวน: ${total.toLocaleString()} ฿` : `ยอดที่ต้องชำระมัดจำ: ${deposit.toLocaleString()} ฿`}
        </Typography>
      </Box>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button
          variant="contained"
          size="large"
          onClick={() =>
            onSelect({
              key: '', // จะใส่ตอน add เข้า cart ใน SellPage
              name: productName,
              category: 'สินค้าพรีเมียม',
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
          ถัดไป
        </Button>
      </DialogActions>
    </Dialog>
  );
}
