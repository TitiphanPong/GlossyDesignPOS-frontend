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

interface InkjetModalProps {
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

export default function InkjetModal({ open, onClose, onSelect, productName, initialData }: InkjetModalProps) {
  const [inkjetType, setinkjetType] = useState('');
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
      // preload กรณีแก้ไข
      setinkjetType(initialData.inkjetType || '');
      setProductNote(initialData.productNote || '');
      if (initialData.sizeFlex && Array.isArray(initialData.sizeFlex)) {
        setSizeFlex(initialData.sizeFlex as SizeItem[]);
      } else {
        setSizeFlex([{ height: '', width: '' }]);
      }
      setPrice(initialData.unitPrice || 0);
      setQuantity(initialData.qty || 1);
      setTotal(initialData.totalPrice || 0);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
    } else {
      // reset กรณีเปิดใหม่
      setinkjetType('');
      setProductNote('');
      setSizeFlex([{ height: '', width: '' }]);
      setPrice(0);
      setQuantity(1);
      setTotal(0);
      setDeposit(0);
      setFullPayment(false);
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
        <DialogContent>
          <Stack
            direction="row"
            spacing={0}
            gap={2}
            flexWrap="wrap"
            justifyContent="center" // 👈 จัดการ์ดให้อยู่ตรงกลาง
            alignItems="flex-start" // 👈 การ์ดแต่ละแถวชิดบน (กันกระโดด)
          >
            {sizeFlex.map((item, index) => (
              <Card
                key={index}
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
                <TextField label="สูง (mm)" value={item.height} onChange={e => handleChange(index, 'height', e.target.value)} fullWidth />
                <TextField label="กว้าง (mm)" value={item.width} onChange={e => handleChange(index, 'width', e.target.value)} fullWidth />
                {sizeFlex.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => removeCard(index)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Delete />
                  </IconButton>
                )}
              </Card>
            ))}
            {/* ปุ่มเพิ่ม */}
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
                <Typography>เพิ่ม Size</Typography>
              </Stack>
            </Card>
          </Stack>
        </DialogContent>

        <Divider sx={{ my: 2 }} />
        {/* ชนิด */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ชนิด :
        </Typography>

        <RadioGroup row value={inkjetType} onChange={e => setinkjetType(e.target.value)} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel value="paper-gloss" control={<Radio />} label="PAPER GLOSS" />
            <FormControlLabel value="pp-board" control={<Radio />} label="PP+PP BOARD" />
            <FormControlLabel value="pp-banner" control={<Radio />} label="PP BANNER" />
            <FormControlLabel value="vinyl" control={<Radio />} label="VINYL" />
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControlLabel value="pp-passwood" control={<Radio />} label="PP+PASSWOOD" />
            <FormControlLabel value="backlid" control={<Radio />} label="BACKLID" />
            <FormControlLabel value="canvas" control={<Radio />} label="CANVAS" />
          </Stack>
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          จำนวนและราคา :
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center" alignItems="center">
          {/* จำนวน */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              จำนวน (ชิ้น) :
            </Typography>
            <TextField type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} sx={{ width: 120 }} inputProps={{ min: 1, style: { textAlign: 'center' } }} />
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* ราคารวม */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              ราคารวม :
            </Typography>
            <TextField
              type="number"
              label="ราคารวม"
              value={total}
              onChange={e => setTotal(Number(e.target.value) || 0)}
              sx={{ width: 150 }}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
              }}
            />
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          รายละเอียดสินค้า :
        </Typography>
        <TextField label="รายละเอียดสินค้า" value={productNote} onChange={e => setProductNote(e.target.value)} fullWidth sx={{ mb: 2 }} />
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
                    fullWidth
                    onChange={e => {
                      if (!fullPayment) {
                        // 👈 อนุญาตแก้ไขเฉพาะตอนเลือกมัดจำ
                        setTotal(Number(e.target.value) || 0);
                      }
                    }}
                    disabled={fullPayment}
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>฿</Typography>,
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
                    onChange={e => {
                      if (fullPayment) {
                        setTotal(Number(e.target.value) || 0);
                      }
                    }}
                    disabled={!fullPayment}
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
              category: 'อิงค์เจ็ท',
              inkjetType,
              sizeFlex,
              productNote,
              qty: quantity,
              unitPrice: quantity > 0 ? total / quantity : total,
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
