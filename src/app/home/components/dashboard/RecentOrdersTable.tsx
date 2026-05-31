'use client';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getDisplayOrderNumber, type ApiCartItem, type ApiOrder } from '../../../../lib/contracts';
import { EmptyState } from '../dashboardUi';

interface RecentOrdersTableProps {
  orders: ApiOrder[];
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid: { label: 'เสร็จสิ้น', cls: 'status-badge status-paid' },
  pending: { label: 'รอดำเนินการ', cls: 'status-badge status-pending' },
  partial: { label: 'ค้างชำระ', cls: 'status-badge status-partial' },
  cancelled: { label: 'ยกเลิก', cls: 'status-badge status-cancelled' },
};

const STATUS_DOT: Record<string, string> = {
  paid: '#16A34A',
  pending: '#4F46E5',
  partial: '#B45309',
  cancelled: '#9CA3AF',
};

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'เงินสด',
  promptpay: 'โอนเงิน',
  transfer: 'โอนบัญชี',
  card: 'บัตร',
};

function formatCurrency(value?: number | null): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `฿ ${amount.toLocaleString('th-TH')}`;
}

function getCustomerInitial(name?: string): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

function getCartQuantity(item?: ApiCartItem): number {
  const rawQty = item?.qty ?? item?.quantity ?? 0;
  return typeof rawQty === 'number' && Number.isFinite(rawQty) ? rawQty : 0;
}

function buildOrderSummary(order: ApiOrder): { primary: string; secondary: string } {
  const items = Array.isArray(order.cart) ? order.cart : [];
  const primaryItem = items[0];
  const itemCount = items.length;
  const totalQty = items.reduce((sum, item) => sum + getCartQuantity(item), 0);

  const primary = primaryItem?.name?.trim() || order.category?.trim() || 'ไม่มีรายละเอียด';

  if (itemCount === 0) {
    return {
      primary,
      secondary: order.category?.trim() || 'ยังไม่ได้ระบุประเภทงาน',
    };
  }

  if (itemCount === 1) {
    const quantityLabel = totalQty > 0 ? `${totalQty} ชิ้น` : '1 รายการ';
    return {
      primary,
      secondary: `${quantityLabel}${order.category ? ` • ${order.category}` : ''}`,
    };
  }

  const quantityLabel = totalQty > 0 ? `${totalQty} ชิ้น` : `${itemCount} รายการ`;
  return {
    primary,
    secondary: `${itemCount} รายการ • ${quantityLabel}${order.category ? ` • ${order.category}` : ''}`,
  };
}

function formatCreatedAt(isoString: string): { relative: string; exact: string } {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return {
      relative: 'ไม่ทราบเวลา',
      exact: '-',
    };
  }

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  let relative = '';
  if (mins < 1) {
    relative = 'เพิ่งสร้าง';
  } else if (mins < 60) {
    relative = `${mins} นาทีที่แล้ว`;
  } else if (hours < 24) {
    relative = `${hours} ชั่วโมงที่แล้ว`;
  } else {
    relative = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }

  return {
    relative,
    exact: date.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export default function RecentOrdersTable({ orders }: Readonly<RecentOrdersTableProps>) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 24 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          background: 'white',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F3F4F6',
          }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
              ออเดอร์ล่าสุด
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2, fontWeight: 500 }}>{orders.length} รายการล่าสุด</Typography>
          </Box>
          <Box
            component={Link}
            href="/home/orders"
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
            }}>
            ดูทั้งหมด →
          </Box>
        </Box>

        {orders.length > 0 ? (
          <TableContainer className="dashboard-scroll" sx={{ maxHeight: 420 }}>
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
                  }}>
                  <TableCell>ออเดอร์</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>รายการงาน</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="right">ยอดรวม</TableCell>
                  <TableCell align="right">ค้างชำระ</TableCell>
                  <TableCell>ชำระ</TableCell>
                  <TableCell>เวลา</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => {
                  const status = STATUS_MAP[order.status] ?? { label: order.status, cls: 'status-badge status-cancelled' };
                  const dot = STATUS_DOT[order.status] ?? '#9CA3AF';
                  const paymentLabel = PAYMENT_LABEL[order.payment] ?? order.payment;
                  const summary = buildOrderSummary(order);
                  const createdAt = formatCreatedAt(order.createdAt);
                  const remaining = typeof order.remainingTotal === 'number' && order.remainingTotal > 0 ? order.remainingTotal : 0;
                  const avatarHue = (index * 47) % 360;

                  return (
                    <TableRow key={order._id} className="orders-table-row" sx={{ '& td': { py: 1.6, px: 2, borderBottom: '1px solid #F9FAFB', fontSize: 13, verticalAlign: 'top' } }}>
                      <TableCell>
                        <Typography component={Link} href={`/print/invoice/${order._id}`} sx={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#6C4DFF', textDecoration: 'none', fontVariantNumeric: 'tabular-nums', '&:hover': { textDecoration: 'underline' } }}>
                          {getDisplayOrderNumber(order)}
                        </Typography>
                        <Typography sx={{ mt: 0.4, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{order.taxInvoice === 'yes' ? 'ใบกำกับภาษี' : 'บิลทั่วไป'}</Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, minWidth: 180 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '8px',
                              background: `hsl(${avatarHue}, 65%, 92%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              color: `hsl(${avatarHue}, 55%, 38%)`,
                              flexShrink: 0,
                            }}>
                            {getCustomerInitial(order.customerName)}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151', lineHeight: 1.3 }}>{order.customerName ?? 'ไม่ระบุชื่อลูกค้า'}</Typography>
                            <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{order.phoneNumber || 'ไม่มีเบอร์โทร'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ minWidth: 220 }}>
                          <Typography sx={{ fontSize: 12.8, fontWeight: 700, color: '#374151', lineHeight: 1.35 }}>{summary.primary}</Typography>
                          <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', lineHeight: 1.35 }}>{summary.secondary}</Typography>
                          {order.note ? (
                            <Typography sx={{ mt: 0.6, fontSize: 11.5, color: '#6B7280', lineHeight: 1.35 }}>หมายเหตุ: {order.note}</Typography>
                          ) : null}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <span className={status.cls}>
                          <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                          {status.label}
                        </span>
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1a1035', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatCurrency(order.grandTotal ?? order.total ?? 0)}</Typography>
                        {typeof order.discount === 'number' && order.discount > 0 ? (
                          <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>ส่วนลด {formatCurrency(order.discount)}</Typography>
                        ) : null}
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: remaining > 0 ? '#B45309' : '#16A34A', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {remaining > 0 ? formatCurrency(remaining) : 'ไม่มีค้าง'}
                        </Typography>
                        {typeof order.vatAmount === 'number' && order.vatAmount > 0 ? (
                          <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>VAT {formatCurrency(order.vatAmount)}</Typography>
                        ) : null}
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: 12.2, color: '#374151', whiteSpace: 'nowrap', fontWeight: 600 }}>{paymentLabel}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: 11.8, color: '#6B7280', whiteSpace: 'nowrap', fontWeight: 600 }}>{createdAt.relative}</Typography>
                        <Typography sx={{ mt: 0.35, fontSize: 11.2, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{createdAt.exact}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3 }}>
            <EmptyState compact title="ยังไม่มีออเดอร์ล่าสุด" subtitle="เมื่อมีออเดอร์จากระบบหลังบ้าน รายการล่าสุดจะปรากฏที่นี่" eyebrow="No Recent Orders" />
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}
