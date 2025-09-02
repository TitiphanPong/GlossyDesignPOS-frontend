'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

type OrderStatus = 'completed' | 'pending' | 'canceled';

interface SaleItem {
  id: string;
  orderNumber: string;
  date: string;
  items: string[];
  total: number;
  status: OrderStatus;
}

const mockSales: SaleItem[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    date: '2025-09-01',
    items: ['นามบัตร', 'ตรายาง'],
    total: 320,
    status: 'completed',
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    date: '2025-08-30',
    items: ['ใบปลิว 100 แผ่น'],
    total: 500,
    status: 'pending',
  },
];

export default function SalesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SaleItem | null>(null);

  const filteredSales = mockSales.filter((sale) => {
    const matchesSearch =
      sale.orderNumber.includes(search) ||
      sale.items.some((item) => item.includes(search));
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesDate =
      (!startDate || dayjs(sale.date).isAfter(startDate.subtract(1, 'day'))) &&
      (!endDate || dayjs(sale.date).isBefore(endDate.add(1, 'day')));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'canceled':
        return 'error';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          รายการขาย
        </Typography>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2 }}>
          <TextField
            placeholder="ค้นหาสินค้า / เลขออเดอร์"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="completed">เสร็จสิ้น</MenuItem>
            <MenuItem value="pending">รอดำเนินการ</MenuItem>
            <MenuItem value="canceled">ยกเลิก</MenuItem>
          </Select>
          <DatePicker
            label="จากวันที่"
            value={startDate}
            onChange={(val) => setStartDate(val)}
          />
          <DatePicker
            label="ถึงวันที่"
            value={endDate}
            onChange={(val) => setEndDate(val)}
          />
        </Stack>

        <Stack spacing={2}>
          {filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardContent
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    📅 {dayjs(sale.date).format('D MMM YY')} | 🧾 {sale.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sale.items.join(', ')}
                  </Typography>
                  <Typography fontWeight="bold" color="primary">
                    ฿ {sale.total.toFixed(2)}
                  </Typography>
                </Box>

                <Stack alignItems="flex-end">
                  <Chip label={sale.status} color={getStatusColor(sale.status)} size="small" />
                  <IconButton onClick={() => setSelectedOrder(sale)} sx={{ mt: 0.5 }}>
                    <ReceiptLongRoundedIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Modal: รายละเอียดออเดอร์ */}
        <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} fullWidth>
          <DialogTitle>รายละเอียดคำสั่งซื้อ</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Stack spacing={1}>
                <Typography>
                  เลขที่ออเดอร์: <b>{selectedOrder.orderNumber}</b>
                </Typography>
                <Typography>วันที่: {dayjs(selectedOrder.date).format('DD/MM/YYYY')}</Typography>
                <Typography>
                  รายการ:
                  <ul>
                    {selectedOrder.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </Typography>
                <Typography>ยอดรวม: ฿ {selectedOrder.total.toFixed(2)}</Typography>
                <Typography>
                  สถานะ:{' '}
                  <Chip
                    label={selectedOrder.status}
                    color={getStatusColor(selectedOrder.status)}
                    size="small"
                  />
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedOrder(null)}>ปิด</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}