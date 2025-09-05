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
  MenuItem,
  Paper,
} from '@mui/material';
import React, { useState } from 'react';

interface VariantOption {
  name: string;
  width: number;
  height: number;
  price: number;
}

interface NamecardModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (order: {
    variant: VariantOption;
    quantity: number;
    customerName: string;
    companyName: string;
    note: string;
    sides: string;
    material: string;
    totalPrice: number;
  }) => void;
  productName: string;
}

const variantList: VariantOption[] = [
  { name: 'Portrait', width: 55, height: 90, price: 3 },
  { name: 'Landscape', width: 90, height: 55, price: 3 },
];

export default function NamecardModal({
  open,
  onClose,
  onSelect,
  productName,
}: NamecardModalProps) {
  const [selected, setSelected] = useState<VariantOption | null>(null);

  const [sides, setSides] = useState<'1' | '2'>('1');
  const [material, setMaterial] = useState('กระดาษ 260 แกรม');
  const [quantity, setQuantity] = useState(100);
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [note, setNote] = useState('');

  const basePrice = selected ? selected.price : 0;
  const sidePrice = sides === '2' ? 1.0 : 0;
  const materialPrice =
    material === 'กระดาษ 300 แกรม' ? 0.5 : material === 'กระดาษพรีเมียม' ? 1.0 : 0;

  const totalPrice = (basePrice + sidePrice + materialPrice) * quantity;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>{productName}</DialogTitle>
      <DialogContent dividers>
        {/* การ์ดเลือกขนาด */}
        <Stack direction="row" spacing={3} justifyContent="center" mb={3}>
          {variantList.map((v, i) => {
            const isSelected = selected?.name === v.name;
            return (
              <Card
                key={i}
                onClick={() => setSelected(v)}
                sx={{
                  width: 180,
                  height: 220,
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 3,
                  p: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: '0.25s',
                  backgroundColor: isSelected ? '#E3F2FD' : 'white',
                  boxShadow: isSelected
                    ? '0 6px 20px rgba(25,118,210,0.2)'
                    : '0 3px 10px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  },
                }}>
                {/* ราคา มุมบนซ้าย */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'white',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    fontSize: 13,
                    fontWeight: 'bold',
                    border: '1px solid #ccc',
                  }}>
                  ฿ {v.price.toFixed(2)}
                </Box>

                {/* กล่อง preview */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                  <Box
                    sx={{
                      width: v.width > v.height ? '80%' : '50%',
                      height: v.height > v.width ? '80%' : '50%',
                      border: '2px solid #333',
                      borderRadius: 1,
                      backgroundColor: '#fafafa',
                    }}
                  />
                </Box>

                {/* ข้อความด้านล่าง */}
                <Box sx={{ textAlign: 'center', mt: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {v.width} × {v.height} mm
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ราคาเริ่มต้น
                  </Typography>
                </Box>
              </Card>
            );
          })}
        </Stack>

        {/* ตัวเลือกเพิ่มเติม */}
        <TextField
          label="ชื่อลูกค้า"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="ชื่อบริษัท"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="การพิมพ์"
            value={sides}
            onChange={e => setSides(e.target.value as '1' | '2')}
            fullWidth>
            <MenuItem value="1">1 ด้าน</MenuItem>
            <MenuItem value="2">2 ด้าน</MenuItem>
          </TextField>

          <TextField
            select
            label="วัสดุกระดาษ"
            value={material}
            onChange={e => setMaterial(e.target.value)}
            fullWidth>
            <MenuItem value="กระดาษ 260 แกรม">กระดาษ 260 แกรม</MenuItem>
            <MenuItem value="กระดาษ 300 แกรม">กระดาษ 300 แกรม</MenuItem>
            <MenuItem value="กระดาษพรีเมียม">กระดาษพรีเมียม</MenuItem>
          </TextField>
        </Stack>

        <TextField
          label="จำนวน (ใบ)"
          type="number"
          value={quantity}
          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value || '1')))}
          sx={{ mb: 2 }}
          fullWidth
        />

        <TextField
          label="หมายเหตุ :"
          value={note}
          onChange={e => setNote(e.target.value)}
          fullWidth
          multiline
          rows={1}
        />

        {/* สรุปราคา */}
        <Typography align="right" fontWeight={800} fontSize={20} color="success.main" mt={2}>
          รวมทั้งหมด: ฿ {totalPrice.toFixed(2)}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button
          variant="contained"
          size="large"
          disabled={!selected}
          onClick={() =>
            selected &&
            onSelect({
              variant: selected,
              quantity,
              customerName,
              companyName,
              note,
              sides,
              material,
              totalPrice,
            })
          }>
          ถัดไป
        </Button>
      </DialogActions>
    </Dialog>
  );
}
