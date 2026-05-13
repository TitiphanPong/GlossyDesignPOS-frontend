'use client';

import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ApiOrder } from '../../../../lib/contracts';

interface RecentOrdersTableProps {
  orders: ApiOrder[];
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid:      { label: 'เสร็จสิ้น',    cls: 'status-badge status-paid' },
  pending:   { label: 'รอดำเนินการ',  cls: 'status-badge status-pending' },
  partial:   { label: 'รอชำระ',       cls: 'status-badge status-partial' },
  cancelled: { label: 'ยกเลิก',       cls: 'status-badge status-cancelled' },
};

const STATUS_DOT: Record<string, string> = {
  paid: '#16A34A',
  pending: '#4F46E5',
  partial: '#B45309',
  cancelled: '#9CA3AF',
};

const PAYMENT_LABEL: Record<string, string> = {
  cash:      '💵 เงินสด',
  promptpay: '📲 โอนเงิน',
};

const MOCK_ORDERS: ApiOrder[] = [
  { _id: '1', orderId: 'ORD-2415', customerName: 'คุณสมศรี มีทรัพย์', category: 'โฟโต้บุ๊ค',     status: 'paid',      payment: 'cash',      total: 2800, createdAt: new Date().toISOString() },
  { _id: '2', orderId: 'ORD-2414', customerName: 'คุณวิชัย ใจดี',      category: 'สติ๊กเกอร์ PVC', status: 'pending',   payment: 'promptpay', total: 650,  createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '3', orderId: 'ORD-2413', customerName: 'คุณมาลี สวยงาม',     category: 'นามบัตร',        status: 'partial',   payment: 'cash',      total: 1200, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '4', orderId: 'ORD-2412', customerName: 'บริษัท ออมทรัพย์ จำกัด', category: 'การ์ดแต่งงาน', status: 'paid',   payment: 'promptpay', total: 4500, createdAt: new Date(Date.now() - 10800000).toISOString() },
  { _id: '5', orderId: 'ORD-2411', customerName: 'คุณธนพล รวยเงิน',    category: 'โปสเตอร์',       status: 'cancelled', payment: 'cash',      total: 780,  createdAt: new Date(Date.now() - 14400000).toISOString() },
  { _id: '6', orderId: 'ORD-2410', customerName: 'คุณสุภา แสนดี',      category: 'สติ๊กเกอร์ PP',  status: 'paid',      payment: 'promptpay', total: 380,  createdAt: new Date(Date.now() - 18000000).toISOString() },
];

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1)   return 'เพิ่งสร้าง';
  if (mins < 60)  return `${mins} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return new Date(isoString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

export default function RecentOrdersTable({ orders }: Readonly<RecentOrdersTableProps>) {
  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 24 }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          background: 'white',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3, py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
              🧾 ออเดอร์ล่าสุด
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2, fontWeight: 500 }}>
              {displayOrders.length} รายการล่าสุด
            </Typography>
          </Box>
          <Box
            component={Link}
            href="/home/saleListPage"
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: '#6C4DFF',
              textDecoration: 'none',
              background: '#F5F0FF',
              px: 2,
              py: 0.8,
              borderRadius: '10px',
              transition: 'all 0.18s',
              '&:hover': { background: '#EDE9FF' },
            }}
          >
            ดูทั้งหมด →
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          className="dashboard-scroll"
          sx={{ maxHeight: 400 }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    background: '#FAFAFA',
                    color: '#9CA3AF',
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #F3F4F6',
                    py: 1.5,
                    px: 2,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <TableCell>ออเดอร์</TableCell>
                <TableCell>ลูกค้า</TableCell>
                <TableCell>ประเภทงาน</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="right">ยอดรวม</TableCell>
                <TableCell>ช่องทาง</TableCell>
                <TableCell>เวลา</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayOrders.map((order, i) => {
                const st = STATUS_MAP[order.status] ?? { label: order.status, cls: 'status-badge status-cancelled' };
                const dot = STATUS_DOT[order.status] ?? '#9CA3AF';
                return (
                  <TableRow
                    key={order._id}
                    className="orders-table-row"
                    sx={{ '& td': { py: 1.6, px: 2, borderBottom: '1px solid #F9FAFB', fontSize: 13 } }}
                  >
                    {/* Order ID */}
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/home/invoice/${order._id}`}
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#6C4DFF',
                          textDecoration: 'none',
                          fontVariantNumeric: 'tabular-nums',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        #{order.orderId || order._id.slice(-6).toUpperCase()}
                      </Typography>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box
                          sx={{
                            width: 28, height: 28,
                            borderRadius: '8px',
                            background: `hsl(${i * 55}, 65%, 92%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            color: `hsl(${i * 55}, 55%, 38%)`,
                            flexShrink: 0,
                          }}
                        >
                          {(order.customerName ?? '?')[0]}
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                          {order.customerName ?? '—'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Typography sx={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
                        {order.category ?? '—'}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span className={st.cls}>
                        <Box
                          component="span"
                          sx={{
                            width: 6, height: 6,
                            borderRadius: '50%',
                            background: dot,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {st.label}
                      </span>
                    </TableCell>

                    {/* Total */}
                    <TableCell align="right">
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1a1035', fontVariantNumeric: 'tabular-nums' }}>
                        ฿ {(order.grandTotal ?? order.total ?? 0).toLocaleString('th-TH')}
                      </Typography>
                    </TableCell>

                    {/* Payment */}
                    <TableCell>
                      <Typography sx={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {PAYMENT_LABEL[order.payment] ?? order.payment}
                      </Typography>
                    </TableCell>

                    {/* Time */}
                    <TableCell>
                      <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {timeAgo(order.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
}
