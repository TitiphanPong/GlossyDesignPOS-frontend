'use client';

import { use, useEffect, useState } from 'react';
import { Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { InvoiceLoadingState, MissingApiConfigState } from '../../components/dashboardUi';
import { fetchApiJson, isMissingApiBaseError } from '../../../../lib/api';

interface CartItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  cart: CartItem[];
  finalTotal: number;
  vatAmount: number;
  grandTotal: number;
}

function InvoiceCopy({ title, order }: Readonly<{ title: string; order: Order }>) {
  return (
    <Card sx={{ p: 2.2, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      <Stack spacing={0.5} sx={{ mb: 1.8 }}>
        <Typography><strong>เลขที่:</strong> {order.orderId}</Typography>
        <Typography><strong>ลูกค้า:</strong> {order.customerName}</Typography>
        <Typography><strong>เบอร์โทร:</strong> {order.phoneNumber}</Typography>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>สินค้า</TableCell>
              <TableCell>จำนวน</TableCell>
              <TableCell>ราคา/หน่วย</TableCell>
              <TableCell align="right">รวม</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.cart.map((item, i) => (
              <TableRow key={`${item.name}-${i}`}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell align="right">{item.totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ my: 1.8 }} />
      <Stack spacing={0.5}>
        <Typography>ยอดก่อน VAT: {order.finalTotal.toFixed(2)} บาท</Typography>
        <Typography>VAT 7%: {order.vatAmount.toFixed(2)} บาท</Typography>
        <Typography variant="h6" fontWeight={800}>ยอดรวมสุทธิ: {order.grandTotal.toFixed(2)} บาท</Typography>
      </Stack>
    </Card>
  );
}

export default function InvoicePage({ params }: Readonly<{ params: Promise<{ orderId: string }> }>) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingApiBase, setMissingApiBase] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await fetchApiJson<Order>(`/orders/${orderId}`);
        setOrder(data);
        setLoadError(null);
      } catch (error) {
        if (isMissingApiBaseError(error)) {
          setMissingApiBase(true);
        } else {
          console.error('Error:', error);
          setLoadError(error instanceof Error && error.message ? error.message : 'โหลดออเดอร์ไม่สำเร็จ');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (missingApiBase) {
    return (
      <Box sx={{ minHeight: '80vh', maxWidth: 960, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าใบกำกับภาษีดึงข้อมูลออเดอร์ได้" />
      </Box>
    );
  }

  if (loading) {
    return <InvoiceLoadingState />;
  }

  if (!order) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'grid', placeItems: 'center' }}>
        <Typography>{loadError ?? 'ไม่พบข้อมูลออเดอร์'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={800}>ใบกำกับภาษี</Typography>
          <Button className="no-print" variant="contained" startIcon={<PrintRoundedIcon />} onClick={() => globalThis.print()}>
            Print / Save PDF
          </Button>
        </Stack>

        <Box id="invoice" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <InvoiceCopy title="ใบกำกับภาษี (ต้นฉบับ)" order={order} />
          <InvoiceCopy title="ใบกำกับภาษี (สำเนา)" order={order} />
        </Box>
      </Box>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice, #invoice * { visibility: visible; }
          #invoice { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </Box>
  );
}


