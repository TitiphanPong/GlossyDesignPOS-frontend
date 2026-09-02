'use client';

import * as React from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Chip } from '@mui/material';
import type { QuotationStatus } from '@/lib/quotations';

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: 'ร่าง',
  SENT: 'รอตอบรับ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธ',
  EXPIRED: 'หมดอายุ',
  CANCELLED: 'ยกเลิก',
  CONVERTED: 'สร้าง Order แล้ว',
};

const STATUS_UI: Record<
  QuotationStatus,
  { color: string; background: string; icon: React.ReactElement<{ sx?: object }> }
> = {
  DRAFT: { color: '#475569', background: '#F1F5F9', icon: <DescriptionRoundedIcon /> },
  SENT: { color: '#1D4ED8', background: '#EFF6FF', icon: <SendRoundedIcon /> },
  APPROVED: { color: '#15803D', background: '#ECFDF3', icon: <CheckCircleRoundedIcon /> },
  REJECTED: { color: '#B42318', background: '#FEF3F2', icon: <CancelRoundedIcon /> },
  EXPIRED: { color: '#B54708', background: '#FFFAEB', icon: <ScheduleRoundedIcon /> },
  CANCELLED: { color: '#7F1D1D', background: '#F8FAFC', icon: <CancelRoundedIcon /> },
  CONVERTED: { color: '#6D28D9', background: '#F5F3FF', icon: <PublishedWithChangesRoundedIcon /> },
};

export function QuotationStatusChip({ status }: Readonly<{ status: QuotationStatus }>) {
  const ui = STATUS_UI[status];
  return (
    <Chip
      size="small"
      icon={React.cloneElement(ui.icon, { sx: { fontSize: '16px !important', color: `${ui.color} !important` } })}
      label={QUOTATION_STATUS_LABELS[status]}
      sx={{
        height: 28,
        borderRadius: 1.5,
        bgcolor: ui.background,
        color: ui.color,
        fontWeight: 800,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

export const quotationMoney = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
});

export const quotationDate = new Intl.DateTimeFormat('th-TH', {
  timeZone: 'Asia/Bangkok',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export const quotationDateTime = new Intl.DateTimeFormat('th-TH', {
  timeZone: 'Asia/Bangkok',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatQuotationDate(value?: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '-' : quotationDate.format(parsed);
}

export function formatQuotationDateTime(value?: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '-' : quotationDateTime.format(parsed);
}

export function quotationDisplayNumber(number?: string): string {
  return number || 'ร่าง — ยังไม่มีเลขใบเสนอราคา';
}

export function statusPrimaryAction(status: QuotationStatus): string {
  switch (status) {
    case 'DRAFT': return 'ส่งใบเสนอราคา';
    case 'SENT': return 'บันทึกการอนุมัติ';
    case 'APPROVED': return 'สร้าง Order จากใบเสนอราคา';
    case 'REJECTED':
    case 'EXPIRED': return 'สร้างฉบับแก้ไข';
    case 'CONVERTED': return 'เปิด Order';
    default: return 'ดูใบเสนอราคา';
  }
}

export function statusIcon(status: QuotationStatus): React.ReactElement {
  if (status === 'SENT') return <HourglassTopRoundedIcon />;
  return STATUS_UI[status].icon;
}
