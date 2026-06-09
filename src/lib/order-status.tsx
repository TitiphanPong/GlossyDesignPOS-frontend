import type { ComponentType } from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import type { OrderStatus, WorkflowOrderStatus } from './contracts';

export type StatusTone = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

export type OrderStatusConfig = {
  value: OrderStatus;
  label: string;
  shortLabel: string;
  description: string;
  color: StatusTone;
  hex: string;
  bg: string;
  icon: ComponentType<{ fontSize?: 'small' | 'medium' | 'large'; sx?: object }>;
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    value: 'pending',
    label: 'รอดำเนินการ',
    shortLabel: 'รอดำเนินการ',
    description: 'รับออเดอร์แล้วและรอตรวจสอบรายละเอียดงาน',
    color: 'warning',
    hex: '#B45309',
    bg: '#FFF7ED',
    icon: HourglassEmptyRoundedIcon,
  },
  producing: {
    value: 'producing',
    label: 'กำลังผลิต',
    shortLabel: 'กำลังผลิต',
    description: 'งานเข้าสู่กระบวนการผลิตหรือจัดเตรียมไฟล์แล้ว',
    color: 'primary',
    hex: '#2563EB',
    bg: '#EFF6FF',
    icon: PrintRoundedIcon,
  },
  awaiting_payment: {
    value: 'awaiting_payment',
    label: 'รอชำระเงิน',
    shortLabel: 'รอชำระ',
    description: 'รอลูกค้าชำระเงินหรือชำระยอดคงเหลือ',
    color: 'info',
    hex: '#0E7490',
    bg: '#ECFEFF',
    icon: PaidRoundedIcon,
  },
  ready_for_pickup: {
    value: 'ready_for_pickup',
    label: 'พร้อมรับสินค้า',
    shortLabel: 'พร้อมรับ',
    description: 'ผลิตเสร็จแล้วและพร้อมให้ลูกค้ารับงาน',
    color: 'secondary',
    hex: '#7C3AED',
    bg: '#F5F3FF',
    icon: TaskAltRoundedIcon,
  },
  delivered: {
    value: 'delivered',
    label: 'จัดส่งแล้ว',
    shortLabel: 'สำเร็จ',
    description: 'ส่งมอบสินค้าให้ลูกค้าเรียบร้อยแล้ว',
    color: 'success',
    hex: '#15803D',
    bg: '#F0FDF4',
    icon: LocalShippingRoundedIcon,
  },
  cancelled: {
    value: 'cancelled',
    label: 'ยกเลิก',
    shortLabel: 'ยกเลิก',
    description: 'ออเดอร์ถูกยกเลิกและหยุดดำเนินการ',
    color: 'error',
    hex: '#DC2626',
    bg: '#FEF2F2',
    icon: CancelRoundedIcon,
  },
  paid: {
    value: 'paid',
    label: 'ชำระแล้ว',
    shortLabel: 'ชำระแล้ว',
    description: 'สถานะเดิมจากระบบชำระเงิน: ชำระครบแล้ว',
    color: 'success',
    hex: '#16A34A',
    bg: '#F0FDF4',
    icon: CheckCircleRoundedIcon,
  },
  partial: {
    value: 'partial',
    label: 'ชำระบางส่วน',
    shortLabel: 'มัดจำแล้ว',
    description: 'สถานะเดิมจากระบบชำระเงิน: รับชำระบางส่วนแล้ว',
    color: 'info',
    hex: '#2563EB',
    bg: '#EFF6FF',
    icon: DoneAllRoundedIcon,
  },
};

export const WORKFLOW_STATUS_SEQUENCE: WorkflowOrderStatus[] = ['pending', 'awaiting_payment', 'producing', 'ready_for_pickup', 'delivered'];

export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  return ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.pending;
}

export function normalizeWorkflowStatus(status: OrderStatus): WorkflowOrderStatus {
  if (status === 'paid' || status === 'partial') return status === 'paid' ? 'producing' : 'awaiting_payment';
  return status;
}

export function getWorkflowStatusIndex(status: OrderStatus): number {
  const workflowStatus = normalizeWorkflowStatus(status);
  const index = WORKFLOW_STATUS_SEQUENCE.indexOf(workflowStatus);
  return Math.max(index, 0);
}
