'use client';

import * as React from 'react';
import Link from 'next/link';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import GlossyDetailDrawer from '@/components/drawers/GlossyDetailDrawer';
import { getCustomerPhoneNumbers, type CustomerDetail } from '@/lib/customers';

const money = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 });

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  partial: 'ชำระบางส่วน',
  paid: 'ชำระแล้ว',
  producing: 'กำลังผลิต',
  awaiting_payment: 'รอชำระเงิน',
  ready_for_pickup: 'พร้อมรับสินค้า',
  delivered: 'จัดส่งแล้ว',
  cancelled: 'ยกเลิก',
};

const PRODUCTION_STAGE_LABELS: Record<string, string> = {
  file_check: 'ตรวจไฟล์',
  queued: 'เข้าคิวผลิต',
  producing: 'กำลังผลิต',
  quality_check: 'ตรวจคุณภาพ',
  ready: 'พร้อมส่งมอบ',
  delivered: 'ส่งมอบแล้ว',
};

const UPLOAD_STATUS_LABELS: Record<string, string> = {
  pending: 'รอตรวจสอบ',
  processing: 'กำลังดำเนินการ',
  completed: 'เสร็จแล้ว',
  cancelled: 'ยกเลิก',
};

function labelFor(value: string | undefined, labels: Record<string, string>): string {
  if (!value) return '-';
  return labels[value] ?? value;
}

function formatDate(value?: string, includeTime = false): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }
    : { dateStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(date);
}

function branchLabel(branchType?: string, branchNo?: string): string | null {
  if (!branchType) return null;
  const normalized = branchType.trim().toLowerCase();
  if (['headquarters', 'head_office', 'head-office', 'สำนักงานใหญ่'].includes(normalized)) return 'สำนักงานใหญ่';
  if (['branch', 'สาขา'].includes(normalized)) return branchNo ? `สาขา ${branchNo}` : 'สาขา';
  return branchNo ? `${branchType} ${branchNo}` : branchType;
}

function buildAddress(customer: CustomerDetail['customer']): string | null {
  const lines = [
    customer.address?.trim(),
    [customer.subDistrict?.trim(), customer.district?.trim()].filter(Boolean).join(' '),
    [customer.province?.trim(), customer.postalCode?.trim()].filter(Boolean).join(' '),
  ].filter((value): value is string => Boolean(value));
  return lines.length ? lines.join('\n') : null;
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <Box>
      <Typography sx={{ mb: 1.2, fontSize: 13, fontWeight: 900, color: '#334155', letterSpacing: '0.02em' }}>{title}</Typography>
      {children}
    </Box>
  );
}

function Field({ label, value }: Readonly<{ label: string; value?: React.ReactNode }>) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 11.5, color: '#8291A5', fontWeight: 700 }}>{label}</Typography>
      <Typography component="div" sx={{ mt: 0.3, fontSize: 13.5, color: '#1E293B', fontWeight: 650, overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>{value}</Typography>
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Stack spacing={2.2}>
      <Skeleton variant="rounded" height={72} />
      <Skeleton variant="rounded" height={86} />
      <Skeleton variant="rounded" height={160} />
      <Skeleton variant="rounded" height={220} />
    </Stack>
  );
}

type CustomerDetailDrawerProps = Readonly<{
  open: boolean;
  detail: CustomerDetail | null;
  loading: boolean;
  onClose: () => void;
  onEdit: (customer: CustomerDetail['customer']) => void;
}>;

export default function CustomerDetailDrawer({ open, detail, loading, onClose, onEdit }: CustomerDetailDrawerProps) {
  const phones = detail ? getCustomerPhoneNumbers(detail.customer) : [];
  const address = detail ? buildAddress(detail.customer) : null;
  const taxBranch = detail ? branchLabel(detail.customer.branchType, detail.customer.branchNo) : null;

  return (
    <GlossyDetailDrawer
      open={open}
      onClose={onClose}
      title={detail?.customer.displayName ?? 'ข้อมูลลูกค้า'}
      subtitle={detail ? detail.customer.customerCode : <Skeleton width={110} />}
      headerActions={(
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {detail ? (
            <Chip
              size="small"
              label={detail.customer.active ? 'Active' : 'Inactive'}
              sx={{ height: 23, bgcolor: detail.customer.active ? '#ECFDF3' : '#F2F4F7', color: detail.customer.active ? '#027A48' : '#667085', fontWeight: 800, fontSize: 11 }}
            />
          ) : null}
          {detail ? (
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit(detail.customer)} sx={{ minHeight: 40, borderRadius: 2.5, textTransform: 'none', fontWeight: 800 }}>
              แก้ไข
            </Button>
          ) : null}
          <IconButton aria-label="ปิดรายละเอียดลูกค้า" onClick={onClose} sx={{ minWidth: 40, minHeight: 40 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      )}>
      {loading && !detail ? <DetailSkeleton /> : null}
      {detail ? (
        <Stack spacing={2.4} divider={<Divider flexItem />}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', border: '1px solid #E5EAF2', borderRadius: 3, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                <Box sx={{ px: 1.7, py: 1.45, borderRight: '1px solid #E5EAF2' }}>
                  <Typography sx={{ fontSize: 11.5, color: '#7A8A9E', fontWeight: 700 }}>ออเดอร์ทั้งหมด</Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 22, color: '#172033', fontWeight: 900 }}>{detail.summary.orderCount.toLocaleString('th-TH')}</Typography>
                </Box>
                <Box sx={{ px: 1.7, py: 1.45 }}>
                  <Typography sx={{ fontSize: 11.5, color: '#7A8A9E', fontWeight: 700 }}>ยอดค้างรวม</Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 22, color: detail.summary.outstandingTotal > 0 ? '#B42318' : '#172033', fontWeight: 900 }}>{money.format(detail.summary.outstandingTotal)}</Typography>
                </Box>
              </Box>

              <Section title="ข้อมูลลูกค้า">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                  <Field label="ชื่อลูกค้า" value={detail.customer.displayName} />
                  <Field label="รหัสลูกค้า" value={detail.customer.customerCode} />
                  <Field label="ชื่อบริษัท" value={detail.customer.companyName} />
                  <Field label="อีเมล" value={detail.customer.email} />
                </Box>
                {phones.length ? (
                  <Box sx={{ mt: 1.4 }}>
                    <Typography sx={{ fontSize: 11.5, color: '#8291A5', fontWeight: 700 }}>เบอร์โทรศัพท์</Typography>
                    <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.65 }}>
                      {phones.map((phone, index) => <Chip key={phone} size="small" label={phone} variant={index === 0 ? 'filled' : 'outlined'} sx={{ fontWeight: 700 }} />)}
                    </Stack>
                  </Box>
                ) : null}
              </Section>

              {(detail.customer.taxId || detail.customer.companyName || taxBranch) ? (
                <Section title="ข้อมูลออกเอกสาร / ภาษี">
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                    <Field label="ชื่อบริษัท" value={detail.customer.companyName} />
                    <Field label="เลขประจำตัวผู้เสียภาษี" value={detail.customer.taxId} />
                    <Field label="สาขา" value={taxBranch} />
                  </Box>
                </Section>
              ) : null}

              {address ? (
                <Section title="ที่อยู่">
                  <Field label="ที่อยู่สำหรับเอกสาร" value={address} />
                </Section>
              ) : null}

              {detail.customer.shippingAddress ? (
                <Section title="ที่อยู่จัดส่ง">
                  <Field label="ที่อยู่จัดส่ง" value={detail.customer.shippingAddress} />
                </Section>
              ) : null}

              <Section title="ประวัติการขาย">
                <Stack spacing={0.9}>
                  {detail.orders.slice(0, 10).map(order => {
                    const orderNumber = order.orderNumber || order.orderId || '-';
                    const remaining = Number(order.remainingTotal || 0);
                    return (
                      <Button
                        key={order._id}
                        component={Link}
                        href={`/home/orders?search=${encodeURIComponent(orderNumber)}`}
                        variant="outlined"
                        sx={{ display: 'block', textAlign: 'left', borderRadius: 2.5, px: 1.5, py: 1.25, color: 'inherit', textTransform: 'none', borderColor: '#E2E8F0', bgcolor: '#FFFFFF' }}>
                        <Stack direction="row" justifyContent="space-between" gap={1.5} alignItems="flex-start">
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 900, color: '#172033' }}>{orderNumber}</Typography>
                            <Typography sx={{ mt: 0.25, fontSize: 11.5, color: '#718096' }}>{formatDate(order.saleDate || order.createdAt)}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 900, color: '#172033' }}>{money.format(Number(order.grandTotal || 0))}</Typography>
                            {remaining > 0 ? <Typography sx={{ fontSize: 11.5, color: '#B42318', fontWeight: 800 }}>ค้าง {money.format(remaining)}</Typography> : null}
                          </Box>
                        </Stack>
                        <Stack direction="row" gap={0.65} flexWrap="wrap" useFlexGap sx={{ mt: 0.9 }}>
                          {order.status ? <Chip size="small" label={labelFor(order.status, ORDER_STATUS_LABELS)} sx={{ height: 22, fontSize: 10.5, fontWeight: 800 }} /> : null}
                          {order.workflowStatus && order.workflowStatus !== order.status ? <Chip size="small" variant="outlined" label={labelFor(order.workflowStatus, ORDER_STATUS_LABELS)} sx={{ height: 22, fontSize: 10.5, fontWeight: 800 }} /> : null}
                        </Stack>
                      </Button>
                    );
                  })}
                  {detail.orders.length === 0 ? <Typography sx={{ py: 1.5, color: '#7A8A9E', fontSize: 13 }}>ยังไม่มีประวัติการสั่งซื้อ</Typography> : null}
                </Stack>
              </Section>

              <Section title="งานผลิตที่กำลังดำเนินการ">
                <Stack spacing={0.9}>
                  {detail.activeProductionJobs.map(job => (
                    <Box key={job._id} sx={{ p: 1.45, border: '1px solid #E2E8F0', borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
                      <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 900, color: '#172033' }}>{job.jobNumber}</Typography>
                          <Typography sx={{ mt: 0.35, fontSize: 12.5, color: '#475569', overflowWrap: 'anywhere' }}>{job.workSummary}</Typography>
                        </Box>
                        <Chip size="small" label={labelFor(job.stage, PRODUCTION_STAGE_LABELS)} sx={{ flexShrink: 0, height: 23, fontSize: 10.5, fontWeight: 800 }} />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.9 }}>
                        <Typography sx={{ fontSize: 11.5, color: '#7A8A9E' }}>กำหนด {formatDate(job.dueAt, true)}</Typography>
                        {job.priority ? <Typography sx={{ fontSize: 11.5, color: job.priority === 'rush' ? '#B42318' : '#7A8A9E', fontWeight: job.priority === 'rush' ? 800 : 600 }}>{job.priority === 'rush' ? 'RUSH' : 'Normal'}</Typography> : null}
                      </Stack>
                    </Box>
                  ))}
                  {detail.activeProductionJobs.length === 0 ? <Typography sx={{ py: 1.5, color: '#7A8A9E', fontSize: 13 }}>ไม่มีงานที่กำลังดำเนินการ</Typography> : null}
                </Stack>
              </Section>

              <Section title="ไฟล์ลูกค้า">
                <Stack spacing={0.8}>
                  {detail.linkedUploads.map(upload => (
                    <Button
                      key={upload._id}
                      component={Link}
                      href={`/home/storage?order=${encodeURIComponent(upload.linkedOrderNumber || '')}`}
                      variant="outlined"
                      sx={{ justifyContent: 'space-between', gap: 1, borderRadius: 2.5, px: 1.4, py: 1.05, textTransform: 'none', borderColor: '#E2E8F0', color: 'inherit', bgcolor: '#FFFFFF' }}>
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 850, color: '#172033' }}>{upload.orderCode || upload.linkedOrderNumber || upload.uploadId}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: '#718096' }}>{upload.jobType}</Typography>
                      </Box>
                      <Chip size="small" label={labelFor(upload.status, UPLOAD_STATUS_LABELS)} sx={{ flexShrink: 0, height: 22, fontSize: 10.5, fontWeight: 800 }} />
                    </Button>
                  ))}
                  {detail.linkedUploads.length === 0 ? <Typography sx={{ py: 1.5, color: '#7A8A9E', fontSize: 13 }}>ยังไม่มีไฟล์ที่เชื่อมกับลูกค้ารายนี้</Typography> : null}
                </Stack>
              </Section>
        </Stack>
      ) : null}
    </GlossyDetailDrawer>
  );
}
