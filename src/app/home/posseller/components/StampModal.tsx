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
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types/cart';

interface StampModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: Partial<CartItem>;
}

export default function StampModal({
  open,
  onClose,
  onSelect,
  productName,
  initialData,
}: StampModalProps) {
  const [type, setType] = useState<'normal' | 'inked'>('normal');
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [productNote, setProductNote] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [fullPayment, setFullPayment] = useState(false);

  const remaining = Math.max(total - deposit, 0);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'normal');
      setShape(initialData.shape || 'circle');
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
        <RadioGroup row value={type} onChange={e => setType(e.target.value as 'normal' | 'inked')}>
          <FormControlLabel value="normal" control={<Radio />} label="ธรรมดา" />
          <FormControlLabel value="inked" control={<Radio />} label="หมึกในตัว" />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        {/* ชนิด */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ชนิด :
        </Typography>
        <RadioGroup
          row
          value={shape}
          onChange={e => setShape(e.target.value as 'circle' | 'square')}>
          <FormControlLabel value="circle" control={<Radio />} label="วงกลม" />
          <FormControlLabel value="square" control={<Radio />} label="สี่เหลี่ยม" />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          รายละเอียดสินค้า :
        </Typography>

        <TextField
          label="รายละเอียดสินค้า"
          value={productNote}
          onChange={e => setProductNote(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* ขนาด, ราคา, จำนวน */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ตัวเลือกเพิ่มเติม :
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="ขนาด" value={size} onChange={e => setSize(e.target.value)} fullWidth />
          <TextField
            label="ราคา"
            type="number"
            value={price}
            onChange={e => setPrice(Number(e.target.value) || 0)}
            fullWidth
          />
          <TextField
            label="จำนวน"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value) || 0)}
            fullWidth
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* การชำระเงิน */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          สรุปราคา :
        </Typography>
        <RadioGroup
          row
          value={fullPayment ? 'full' : 'deposit'}
          onChange={e => setFullPayment(e.target.value === 'full')}
          sx={{ width: '100%' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems="stretch"
            flexWrap="wrap"
            sx={{ width: '100%' }}>
            {/* มัดจำ */}
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 280,
                borderColor: !fullPayment ? 'primary.main' : 'grey.300',
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
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
                    }}
                  />
                  <TextField
                    label="ยอดมัดจำ"
                    type="number"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value) || 0)}
                    fullWidth
                    disabled={fullPayment}
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
                    }}
                  />
                  <TextField
                    label="คงค้าง"
                    value={remaining}
                    fullWidth
                    disabled
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
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
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
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
          {fullPayment
            ? `ยอดที่ต้องชำระเต็มจำนวน: ${total.toLocaleString()} ฿`
            : `ยอดที่ต้องชำระมัดจำ: ${deposit.toLocaleString()} ฿`}
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
              category: 'ตรายาง',
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
            } as CartItem)
          }>
          ถัดไป
        </Button>
      </DialogActions>
    </Dialog>
  );
}
