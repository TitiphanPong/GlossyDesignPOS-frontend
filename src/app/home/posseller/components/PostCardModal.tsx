'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, Box, Card, TextField, Divider, FormControlLabel, RadioGroup, Radio, CardContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CartItem } from '../types/cart';

interface VariantOption {
  name: string;
  width: number;
  height: number;
  custom?: boolean;
  description?: string;
}

interface PostCardModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CartItem) => void;
  productName: string;
  initialData?: any;
}

const variantList: VariantOption[] = [
  { name: 'A5', width: 5, height: 7, description: 'ขั้นต่ำ 2 รูป' },
  { name: 'A6', width: 4, height: 6, description: 'ขั้นต่ำ 4 รูป' },
  { name: 'Custom Size', width: 0, height: 0, custom: true },
];

export default function PostCardModal({ open, onClose, onSelect, productName, initialData }: PostCardModalProps) {
  const [selected, setSelected] = useState<VariantOption | null>(null);
  const [material, setMaterial] = useState('other');
  const [quantity, setQuantity] = useState(1);
  const [setCount, setSetCount] = useState(1); // ✅ จำนวนชุด
  const [productNote, setProductNote] = useState('');
  const [total, setTotal] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [fullPayment, setFullPayment] = useState<boolean>(false);

  const remaining = Math.max(total - deposit, 0);

  // state สำหรับ custom size
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setQuantity(initialData.qty || 1);
      setDeposit(initialData.deposit || 0);
      setFullPayment(initialData.fullPayment || false);
      setMaterial(initialData.material || '');
      setTotal(initialData.total ?? initialData.totalPrice ?? 0);
      if (initialData.variant) setSelected(initialData.variant);
    }
  }, [initialData, open]);

  useEffect(() => {
    if (selected?.name === 'A5') {
      setSetCount(Math.ceil(quantity / 2)); // A5 ขั้นต่ำ 2 ใบ = 1 ชุด
    } else if (selected?.name === 'A6') {
      setSetCount(Math.ceil(quantity / 4)); // A6 ขั้นต่ำ 4 ใบ = 1 ชุด
    } else {
      setSetCount(quantity); // Custom = 1 ใบ = 1 ชุด
    }
  }, [quantity, selected]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>{productName}</DialogTitle>
      <DialogContent dividers>
        {/* การ์ดเลือกขนาด */}
        <Stack direction="row" spacing={0} justifyContent="center" mb={3} flexWrap="wrap" sx={{ gap: 2 }}>
          {variantList.map((v, i) => {
            const isSelected = selected?.name === v.name;
            const isCustom = v.custom;
            return (
              <Card
                key={i}
                onClick={() => setSelected(v)}
                sx={{
                  height: 260,
                  flex: {
                    xs: '0 0 100%', // มือถือ: 1 การ์ดต่อแถว
                    sm: '0 0 50%', // tablet: 2 การ์ดต่อแถว
                    md: '0 0 28%', // desktop: 3 การ์ดต่อแถว
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
                {/* preview */}
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

                {/* description custom */}
                {isCustom ? (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Custom Size (นิ้ว)
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
                          setCustomWidth(val === '' ? 0 : parseInt(val, 10));
                        }}
                        sx={{ width: 70 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                      <TextField
                        size="small"
                        type="text"
                        label="H"
                        value={customHeight}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCustomHeight(val === '' ? 0 : parseInt(val, 10));
                        }}
                        sx={{ width: 70 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', mt: 0 }}>
                    <Typography variant="body1" color="text.secondary">
                      {v.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mt={1}>
                      {v.width} × {v.height} นิ้ว
                    </Typography>
                    <Typography variant="body2" color="red" fontWeight={600} mt={1}>
                      ** {v.description} **
                    </Typography>
                  </Box>
                )}
              </Card>
            );
          })}
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom>
          รายละเอียดสินค้า :
        </Typography>
        <TextField label="รายละเอียดสินค้า" value={productNote} onChange={e => setProductNote(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          ชนิดกระดาษ :
        </Typography>
        <RadioGroup row value={material} onChange={e => setMaterial(e.target.value)} sx={{ justifyContent: 'center', gap: 3 }}>
          <FormControlLabel value="160g" control={<Radio />} label="160 แกรม" />
          <FormControlLabel value="260g" control={<Radio />} label="260 แกรม" />
          <FormControlLabel value="300g" control={<Radio />} label="300 แกรม" />
          <FormControlLabel value="other" control={<Radio />} label="อื่นๆ" />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          จำนวน (ชุด) :
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center" alignItems="center">
          {/* จำนวน */}
          <Typography variant="body1" sx={{ mr: 1, fontWeight: 600 }}>
            จำนวน (ใบ) :
          </Typography>
          <TextField label="จำนวน (ใบ)" type="string" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} sx={{ width: 120 }} inputProps={{ min: 1 }} />

          <Typography variant="body1" sx={{ mr: 1, fontWeight: 600 }}>
            นับเป็นจำนวน (Set) : {setCount} ชุด
          </Typography>
          {/* ราคารวม */}

          <Divider orientation="vertical" flexItem />
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              ราคารวม :
            </Typography>
            <TextField
              type="string"
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

        <Typography variant="body2" sx={{ mr: 1, fontWeight: 600, mt: 2, color: 'red' }}>
          *** หมายเหตุ : ถ้าเป็น A5 ขั้นต่ำ 2 ใบต่อ 1 ชุด , A6 ขั้นต่ำ 4 ใบต่อ 1 ชุด || (1 Set = {selected?.name === 'A5' ? '2 ใบ' : selected?.name === 'A6' ? '4 ใบ' : '1 ใบ'})
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* มัดจำ/เต็มจำนวน */}
        <Box sx={{ mt: 3 }}>
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
                  <FormControlLabel value="deposit" control={<Radio />} label={<Typography fontWeight={600}>มัดจำสินค้า</Typography>} />
                  <Stack spacing={2} mt={2}>
                    <TextField label="ยอดรวม" type="number" value={total} onChange={e => setTotal(Number(e.target.value) || 0)} fullWidth disabled={fullPayment} />
                    <TextField
                      label="ยอดมัดจำ"
                      type="number"
                      value={deposit}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setDeposit(Math.min(Math.max(val, 0), total)); // ✅ clamp ไม่ให้ติดลบ หรือเกิน total
                      }}
                      fullWidth
                      disabled={fullPayment}
                    />
                    <TextField label="คงค้าง" value={remaining} fullWidth disabled />
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
                  <FormControlLabel value="full" control={<Radio />} label={<Typography fontWeight={600}>ชำระเต็มจำนวน</Typography>} />
                  <Stack spacing={2} mt={2}>
                    <TextField label="จำนวนเงิน" type="number" value={total} onChange={e => setTotal(Number(e.target.value) || 0)} fullWidth />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </RadioGroup>
        </Box>
      </DialogContent>

      {/* แสดงยอดรวมด้านล่าง */}
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
          disabled={!selected}
          onClick={() =>
            selected &&
            onSelect({
              key: '',
              name: productName,
              category: 'โพสการ์ด',
              variant: {
                ...selected,
                width: customWidth,
                height: customHeight,
              },
              productNote,
              material,
              qty: quantity,
              setCount, // ✅ ส่งจำนวนชุด
              unitPrice: total / (quantity || 1),
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
