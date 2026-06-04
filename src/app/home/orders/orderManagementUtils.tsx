import * as React from 'react';

import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import type { JobTimelineCardItem } from '../components/JobTimelineCard';
import { statusChipSx } from '../components/adminUi';
import { fetchApi } from '../../../lib/api';
import { getDisplayOrderNumber, type NormalizedOrder, type PaymentMethod } from '../../../lib/contracts';
import { fetchOrders, sortOrdersByNewest } from '../../../lib/orders';
import type { ExportType, OrderRow, PaymentStatus, SortOrder } from './orderManagementTypes';

export const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
export const STATUS_LABELS_TH: Record<PaymentStatus, string> = {
  pending: 'รอชำระเงิน',
  partial: 'ชำระบางส่วน',
  paid: 'ชำระแล้ว',
  cancelled: 'ยกเลิกงาน',
};
export const FILTER_STATUS_LABELS: Record<'all' | PaymentStatus, string> = {
  all: 'ทั้งหมด',
  ...STATUS_LABELS_TH,
};
export const PAYMENT_METHOD_LABELS_TH: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  promptpay: 'พร้อมเพย์',
};
export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  newest: 'ล่าสุด',
  oldest: 'เก่าสุด',
  high: 'ยอดรวมสูงสุด',
  low: 'ยอดรวมต่ำสุด',
};
export const ORDER_TABLE_STATUS_UI: Record<PaymentStatus, { label: string; dot: string }> = {
  paid: { label: STATUS_LABELS_TH.paid, dot: '#16A34A' },
  pending: { label: STATUS_LABELS_TH.pending, dot: '#4F46E5' },
  partial: { label: STATUS_LABELS_TH.partial, dot: '#B45309' },
  cancelled: { label: STATUS_LABELS_TH.cancelled, dot: '#9CA3AF' },
};
export const ORDER_TABLE_PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: PAYMENT_METHOD_LABELS_TH.cash,
  promptpay: PAYMENT_METHOD_LABELS_TH.promptpay,
};

export function mapApiOrderToRow(order: NormalizedOrder): OrderRow {
  const createdAt = order.createdAt || dayjs().toISOString();
  const products = (order.cart ?? []).map(item => ({
    name: item.name || item.category || 'สินค้าไม่ระบุชื่อ',
    qty: item.qty,
    price: item.price,
  }));

  const status = order.status;
  const timeline = [{ title: 'สร้างรายการงาน', at: createdAt }] as OrderRow['timeline'];

  if (status === 'paid') {
    timeline.push({ title: 'ชำระเงินเรียบร้อย', at: createdAt });
  }
  if (status === 'pending') {
    timeline.push({ title: 'รอชำระเงิน', at: createdAt });
  }
  if (status === 'partial') {
    timeline.push({ title: 'รับชำระบางส่วนแล้ว', at: createdAt });
  }
  if (status === 'cancelled') {
    timeline.push({ title: 'ยกเลิกรายการงาน', at: createdAt });
  }

  return {
    id: order._id || order.orderId,
    orderId: order.orderId,
    orderNumber: getDisplayOrderNumber(order),
    customerName: order.customerName || 'ลูกค้าไม่ระบุชื่อ',
    phoneNumber: order.phoneNumber || '-',
    date: createdAt,
    month: dayjs(createdAt).format('YYYY-MM'),
    status,
    subtotal: order.subtotal,
    discount: order.discount,
    vat: order.vatAmount,
    total: order.grandTotal,
    paidAmount: order.paidAmount,
    paymentMethod: order.payment,
    products,
    timeline,
  };
}

export async function fetchOrderRows(): Promise<OrderRow[]> {
  const orders = await fetchOrders();
  return sortOrdersByNewest(orders).map(mapApiOrderToRow);
}

export async function updateOrderStatus(orderId: string, status: PaymentStatus): Promise<void> {
  const endpoints = [`/orders/${orderId}/status`, `/orders/${orderId}`];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      await fetchApi(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('update_request_failed');
    }
  }

  throw lastError ?? new Error('update_request_failed');
}

export function formatMoney(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatTableCurrency(amount: number) {
  return `฿ ${amount.toLocaleString('th-TH')}`;
}

export function getCustomerInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

export function buildOrderLineSummary(row: OrderRow): { primary: string; secondary: string } {
  const primaryItem = row.products[0];
  const itemCount = row.products.length;
  const totalQty = row.products.reduce((sum, item) => sum + Math.max(0, item.qty || 0), 0);
  const primary = primaryItem?.name?.trim() || 'ไม่มีรายละเอียดรายการ';

  if (itemCount <= 1) {
    return {
      primary,
      secondary: `${Math.max(totalQty, 1)} ชิ้น`,
    };
  }

  return {
    primary,
    secondary: `${itemCount} รายการ • ${Math.max(totalQty, itemCount)} ชิ้น`,
  };
}

export function formatOrderRowTime(value: string): { relative: string; exact: string } {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { relative: 'ไม่ทราบเวลา', exact: '-' };
  }

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);

  if (mins < 1) {
    return {
      relative: 'เมื่อสักครู่',
      exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }

  if (mins < 60) {
    return {
      relative: `${mins} นาทีที่แล้ว`,
      exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }

  if (hours < 24) {
    return {
      relative: `${hours} ชั่วโมงที่แล้ว`,
      exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }

  return {
    relative: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
}

export function formatThaiFullDate(value: dayjs.Dayjs | null): string {
  if (!value) return 'กำลังโหลดวันที่';
  const date = value.toDate();
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

export function formatMonthFilterLabel(month: string): string {
  const [year, monthIndexText] = month.split('-');
  const monthIndex = Number(monthIndexText) - 1;
  const yearNumber = Number(year);

  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11 || !Number.isInteger(yearNumber)) {
    return month;
  }

  return `${MONTHS_TH[monthIndex]} ${yearNumber + 543}`;
}

export function buildOrderPaymentTimelineSubtitle(order: OrderRow): string {
  const remaining = Math.max(order.total - order.paidAmount, 0);

  if (order.status === 'paid') {
    return `ชำระครบแล้วผ่าน ${PAYMENT_METHOD_LABELS_TH[order.paymentMethod]}`;
  }

  if (order.status === 'partial') {
    return `ชำระแล้ว ฿${formatMoney(order.paidAmount)} คงเหลือ ฿${formatMoney(remaining)}`;
  }

  if (order.status === 'cancelled') {
    return 'รายการนี้ถูกยกเลิกและหยุดการดำเนินงานแล้ว';
  }

  return `สถานะปัจจุบัน: ${STATUS_LABELS_TH[order.status]}`;
}

export function buildOrderTimelineItems(order: OrderRow): JobTimelineCardItem[] {
  const activeStage: 'created' | 'payment' = order.status === 'pending' ? 'created' : 'payment';
  let productionSubtitle = 'รอเข้าสู่กระบวนการผลิต';

  if (order.status === 'paid' || order.status === 'partial') {
    productionSubtitle = 'พร้อมส่งต่อเข้ากระบวนการผลิต';
  } else if (order.status === 'cancelled') {
    productionSubtitle = 'หยุดการดำเนินการตามสถานะรายการงาน';
  }

  const steps: Array<{ id: string; title: string; subtitle: string; icon: React.ReactNode; active: boolean }> = [
    {
      id: 'order-created',
      title: 'สร้างรายการงาน',
      subtitle: 'บันทึกคำสั่งซื้อเข้าสู่ระบบ',
      icon: <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />,
      active: activeStage === 'created',
    },
    {
      id: 'order-confirmed',
      title: 'ยืนยันข้อมูลลูกค้าและรายการผลิต',
      subtitle: 'ตรวจสอบรายละเอียดงานก่อนดำเนินการ',
      icon: <FactCheckRoundedIcon sx={{ fontSize: 18 }} />,
      active: false,
    },
    {
      id: 'order-payment',
      title: 'อัปเดตสถานะการชำระเงิน',
      subtitle: buildOrderPaymentTimelineSubtitle(order),
      icon: <PaymentsRoundedIcon sx={{ fontSize: 18 }} />,
      active: activeStage === 'payment',
    },
    {
      id: 'order-production',
      title: 'เตรียมงานผลิต / พิมพ์',
      subtitle: productionSubtitle,
      icon: <PrintRoundedIcon sx={{ fontSize: 18 }} />,
      active: false,
    },
  ];

  return steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    subtitle: step.subtitle,
    icon: step.icon,
    active: step.active,
    pillLabel: step.active ? 'ล่าสุด' : `ขั้นตอน ${index + 1}`,
  }));
}

export function statusChip(status: PaymentStatus) {
  if (status === 'paid') {
    return <Chip label={STATUS_LABELS_TH[status]} color="success" size="small" sx={statusChipSx} />;
  }
  if (status === 'pending') {
    return <Chip label={STATUS_LABELS_TH[status]} color="warning" size="small" sx={statusChipSx} />;
  }
  if (status === 'partial') {
    return <Chip label={STATUS_LABELS_TH[status]} color="info" size="small" sx={statusChipSx} />;
  }
  return <Chip label={STATUS_LABELS_TH[status]} color="error" size="small" sx={statusChipSx} />;
}

export function getLoadOrdersErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'โหลดรายการงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
}

function matchesSearch(row: OrderRow, search: string): boolean {
  const normalizedQuery = search.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  return row.customerName.toLowerCase().includes(normalizedQuery) || row.orderNumber.toLowerCase().includes(normalizedQuery) || row.phoneNumber.toLowerCase().includes(normalizedQuery);
}

function matchesStatusFilter(row: OrderRow, statusFilter: 'all' | PaymentStatus): boolean {
  return statusFilter === 'all' || row.status === statusFilter;
}

function matchesMonthFilter(row: OrderRow, monthFilter: string): boolean {
  return monthFilter === 'all' || row.month === monthFilter;
}

function compareOrderRows(a: OrderRow, b: OrderRow, sort: SortOrder): number {
  if (sort === 'high') return b.total - a.total;
  if (sort === 'low') return a.total - b.total;

  const t1 = dayjs(a.date).valueOf();
  const t2 = dayjs(b.date).valueOf();
  return sort === 'newest' ? t2 - t1 : t1 - t2;
}

export function filterOrderRows(rows: OrderRow[], search: string, statusFilter: 'all' | PaymentStatus, monthFilter: string, sort: SortOrder): OrderRow[] {
  return rows
    .filter(row => matchesSearch(row, search))
    .filter(row => matchesStatusFilter(row, statusFilter))
    .filter(row => matchesMonthFilter(row, monthFilter))
    .sort((a, b) => compareOrderRows(a, b, sort));
}

export function buildOrderStats(rows: OrderRow[]) {
  const todayKey = dayjs().format('YYYY-MM-DD');
  const currentMonth = dayjs().format('YYYY-MM');

  return rows.reduce(
    (stats, row) => {
      stats.totalSales += row.total;

      if (row.status === 'pending' || row.status === 'partial') {
        stats.pendingPayments += Math.max(row.total - row.paidAmount, 0);
      }
      if (row.status === 'paid') {
        stats.paidOrders += 1;
      }
      if (dayjs(row.date).format('YYYY-MM-DD') === todayKey) {
        stats.ordersToday += 1;
      }
      if (row.month === currentMonth) {
        stats.ordersThisMonth += 1;
      }

      return stats;
    },
    {
      totalSales: 0,
      pendingPayments: 0,
      paidOrders: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
    }
  );
}

export function downloadCsv(rows: OrderRow[], label: ExportType) {
  const headers = ['เลขที่งาน', 'ลูกค้า', 'เบอร์โทรศัพท์', 'วันที่', 'สถานะ', 'ยอดรวม'];
  const lines = rows.map(row => [row.orderNumber, row.customerName, row.phoneNumber, dayjs(row.date).format('DD/MM/YYYY HH:mm'), STATUS_LABELS_TH[row.status], row.total]);
  const csv = [headers, ...lines].map(line => line.map(item => `"${String(item).replaceAll('"', '""')}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cashierprint-${label}-${dayjs().format('YYYY-MM-DD')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function printDocument(row: OrderRow, mode: 'receipt' | 'invoice') {
  const documentType = mode === 'invoice' ? 'tax-invoice' : 'receipt';
  const targetPath = `/print/invoice/${encodeURIComponent(row.orderId)}?documentType=${documentType}`;
  window.open(targetPath, '_blank', 'noopener,noreferrer');
}
