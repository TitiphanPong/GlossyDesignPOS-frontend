'use client';

import * as React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { canOverridePrice, fetchCurrentAdminRole, type AdminRole } from '@/lib/admin-capabilities';
import {
  approveQuotation,
  cancelQuotation,
  convertQuotationToOrder,
  fetchQuotation,
  QuotationApiError,
  rejectQuotation,
  reviseQuotation,
  sendQuotation,
  type Quotation,
  type QuotationConversionConflict,
} from '@/lib/quotations';
import AdminHeroHeader, { heroOutlineButtonSx } from '../../components/AdminHeroHeader';
import AdminPageContainer from '../../components/AdminPageContainer';
import { uiCardSx } from '../../components/adminUi';
import DataTable, { type DataTableColumn } from '../../components/DataTable';
import QuotationBuilder from '../QuotationBuilder';
import {
  formatQuotationDate,
  formatQuotationDateTime,
  quotationDisplayNumber,
  quotationMoney,
  QuotationStatusChip,
} from '../quotationUi';

type DialogMode = 'approve' | 'reject' | 'revise' | 'cancel' | 'convert' | null;

function LabelValue({ label, value }: Readonly<{ label: string; value?: React.ReactNode }>) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
      <Typography sx={{ mt: 0.25, fontWeight: 650, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Box>
  );
}

export default function QuotationDetailPage() {
  const params = useParams<{ quotationId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quotationId = params.quotationId;
  const editMode = searchParams.get('edit') === '1';
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [role, setRole] = React.useState<AdminRole | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dialog, setDialog] = React.useState<DialogMode>(null);
  const [reason, setReason] = React.useState('');
  const [conflicts, setConflicts] = React.useState<QuotationConversionConflict[]>([]);
  const [convertedOrderId, setConvertedOrderId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, currentRole] = await Promise.all([fetchQuotation(quotationId), fetchCurrentAdminRole()]);
      setQuotation(data);
      setRole(currentRole);
      setConvertedOrderId(data.convertedOrderId ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'โหลดใบเสนอราคาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const updateState = (next: Quotation) => {
    setQuotation(next);
    setError(null);
  };

  const runSend = async () => {
    if (!quotation) return;
    setActing(true);
    setError(null);
    try {
      const result = await sendQuotation(quotation._id, quotation.version);
      updateState(result);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'อัปเดตใบเสนอราคาไม่สำเร็จ');
      await load();
    } finally {
      setActing(false);
    }
  };

  const submitReasonAction = async () => {
    if (!quotation || !dialog) return;
    if ((dialog === 'approve' || dialog === 'reject' || dialog === 'cancel') && !reason.trim()) {
      setError(dialog === 'approve' ? 'กรุณาระบุหมายเหตุการยืนยันจากลูกค้า' : 'กรุณาระบุเหตุผล');
      return;
    }
    setActing(true);
    try {
      let result: Quotation;
      if (dialog === 'approve') result = await approveQuotation(quotation._id, quotation.version, reason.trim());
      else if (dialog === 'reject') result = await rejectQuotation(quotation._id, quotation.version, reason.trim());
      else if (dialog === 'revise') result = await reviseQuotation(quotation._id, quotation.version, reason.trim() || undefined);
      else if (dialog === 'cancel') result = await cancelQuotation(quotation._id, quotation.version, reason.trim());
      else return;
      updateState(result);
      setDialog(null);
      setReason('');
      if (dialog === 'revise') router.replace(`/home/quotations/${encodeURIComponent(quotation._id)}?edit=1`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'อัปเดตใบเสนอราคาไม่สำเร็จ');
      await load();
    } finally {
      setActing(false);
    }
  };

  const convert = async (confirmConflict = false) => {
    if (!quotation) return;
    setActing(true);
    setError(null);
    try {
      const result = await convertQuotationToOrder(quotation._id, quotation.version, {
        confirmQuotedPrice: confirmConflict,
        ...(confirmConflict ? { priceConflictReason: reason.trim() } : {}),
      });
      updateState(result.quotation);
      setConvertedOrderId(result.order._id);
      setConflicts([]);
      setReason('');
      setDialog(null);
      router.push(`/home/orders?focus=${encodeURIComponent(result.order._id)}`);
    } catch (actionError) {
      if (actionError instanceof QuotationApiError && actionError.code === 'QUOTATION_PRICE_CONFLICT') {
        setConflicts(actionError.conflicts);
        setDialog('convert');
        setError('ราคาสินค้าปัจจุบันต่างจากราคาที่เสนอ กรุณาตรวจสอบก่อนสร้าง Order');
      } else {
        setError(actionError instanceof Error ? actionError.message : 'สร้าง Order ไม่สำเร็จ');
        await load();
      }
    } finally {
      setActing(false);
    }
  };

  if (loading && !quotation) {
    return <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  }

  if (!quotation) {
    return (
      <AdminPageContainer>
        <Alert severity="error">{error ?? 'ไม่พบใบเสนอราคา'}</Alert>
      </AdminPageContainer>
    );
  }

  if (editMode && quotation.status === 'DRAFT') {
    return (
      <AdminPageContainer>
        <Stack spacing={2}>
          <AdminHeroHeader
            title={`แก้ไข ${quotationDisplayNumber(quotation.quotationNumber)}`}
            description={`Revision ${quotation.revision} · Draft แก้ไขได้จนกว่าจะส่ง`}
            lastSynced={formatQuotationDateTime(quotation.updatedAt)}
            thaiDate="ยอดเงินจะถูก Backend resolve ใหม่ทุกครั้งที่บันทึก"
            mb={0}
            actions={<Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => router.replace(`/home/quotations/${encodeURIComponent(quotation._id)}`)} sx={heroOutlineButtonSx}>กลับรายละเอียด</Button>}
          />
          <QuotationBuilder
            quotation={quotation}
            onSaved={next => setQuotation(next)}
            onCancel={() => router.replace(`/home/quotations/${encodeURIComponent(quotation._id)}`)}
          />
        </Stack>
      </AdminPageContainer>
    );
  }

  const canCancel = quotation.status === 'DRAFT' || ((quotation.status === 'SENT' || quotation.status === 'APPROVED') && canOverridePrice(role));
  const itemTableColumns: DataTableColumn<Quotation['items'][number]>[] = [
    {
      key: 'index',
      header: '#',
      width: 56,
      render: (_item, index) => index + 1,
    },
    {
      key: 'item',
      header: 'รายการ',
      render: item => (
        <Box>
          <Typography fontWeight={700}>{item.name}</Typography>
          {item.variantName ? <Typography variant="caption" color="text.secondary">{item.variantName}</Typography> : null}
          {item.description ? <Typography variant="body2" color="text.secondary">{item.description}</Typography> : null}
        </Box>
      ),
    },
    {
      key: 'quantity',
      header: 'จำนวน',
      align: 'right',
      render: item => `${item.quantity.toLocaleString('th-TH')} ${item.unit}`,
    },
    {
      key: 'unitPrice',
      header: 'ราคาต่อหน่วย',
      align: 'right',
      render: item => quotationMoney.format(item.authoritativeUnitPrice),
    },
    {
      key: 'lineTotal',
      header: 'รวม',
      align: 'right',
      render: item => <Typography fontWeight={800}>{quotationMoney.format(item.lineTotal)}</Typography>,
    },
  ];

  return (
    <AdminPageContainer>
      <Stack spacing={2.25}>
        <AdminHeroHeader
          title={quotationDisplayNumber(quotation.quotationNumber)}
          description={`Revision ${quotation.revision}`}
          lastSynced={formatQuotationDateTime(quotation.updatedAt)}
          thaiDate={`ออก ${formatQuotationDate(quotation.issuedAt)} · ใช้ได้ถึง ${formatQuotationDate(quotation.validUntil)}`}
          mb={0}
          notice={error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : undefined}
          actions={
            <>
              <Button component={Link} href="/home/quotations" variant="outlined" startIcon={<ArrowBackRoundedIcon />} sx={heroOutlineButtonSx}>กลับรายการ</Button>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void load()} disabled={acting} sx={heroOutlineButtonSx}>รีเฟรช</Button>
              <Button component={Link} href={`/print/quotation/${encodeURIComponent(quotation._id)}`} target="_blank" variant="outlined" startIcon={<PrintRoundedIcon />} sx={heroOutlineButtonSx}>พิมพ์ / PDF</Button>
            </>
          }
        />

        <Card sx={uiCardSx}>
          <CardContent>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" gap={1.5}>
              <QuotationStatusChip status={quotation.status} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {quotation.status === 'DRAFT' ? <Button component={Link} href={`/home/quotations/${encodeURIComponent(quotation._id)}?edit=1`} startIcon={<EditRoundedIcon />} variant="outlined">แก้ไข</Button> : null}
                {quotation.status === 'DRAFT' ? <Button onClick={() => void runSend()} startIcon={<SendRoundedIcon />} variant="contained" disabled={acting}>ส่งใบเสนอราคา</Button> : null}
                {quotation.status === 'SENT' ? <Button onClick={() => { setReason(''); setDialog('approve'); }} startIcon={<CheckRoundedIcon />} variant="contained" disabled={acting}>บันทึกการอนุมัติ</Button> : null}
                {quotation.status === 'SENT' ? <Button color="error" onClick={() => { setReason(''); setDialog('reject'); }} startIcon={<ThumbDownRoundedIcon />} variant="outlined" disabled={acting}>ปฏิเสธใบเสนอราคา</Button> : null}
                {['SENT', 'APPROVED', 'REJECTED', 'EXPIRED'].includes(quotation.status) ? <Button onClick={() => { setReason(''); setDialog('revise'); }} startIcon={<ReplayRoundedIcon />} variant="outlined" disabled={acting}>สร้างฉบับแก้ไข</Button> : null}
                {quotation.status === 'APPROVED' ? <Button onClick={() => { setConflicts([]); setReason(''); setDialog('convert'); }} startIcon={<PublishedWithChangesRoundedIcon />} variant="contained" disabled={acting}>สร้าง Order จากใบเสนอราคา</Button> : null}
                {quotation.status === 'CONVERTED' && convertedOrderId ? <Button component={Link} href={`/home/orders?focus=${encodeURIComponent(convertedOrderId)}`} startIcon={<OpenInNewRoundedIcon />} variant="contained">เปิด Order</Button> : null}
                {canCancel ? <Button color="error" variant="text" startIcon={<CancelRoundedIcon />} onClick={() => { setReason(''); setDialog('cancel'); }} disabled={acting}>ยกเลิกใบเสนอราคา</Button> : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(320px, .7fr)' }, gap: 2, alignItems: 'start' }}>
          <Stack spacing={2}>
            <Card sx={uiCardSx}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>ข้อมูลลูกค้า</Typography>
                <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                  <LabelValue label="ชื่อลูกค้า" value={quotation.customerSnapshot.customerName} />
                  <LabelValue label="เบอร์โทรศัพท์" value={quotation.customerSnapshot.phoneNumber} />
                  <LabelValue label="อีเมล" value={quotation.customerSnapshot.email} />
                  <LabelValue label="เลขประจำตัวผู้เสียภาษี" value={quotation.customerSnapshot.taxId} />
                  <LabelValue label="สาขา" value={[quotation.customerSnapshot.branchType, quotation.customerSnapshot.branchNo].filter(Boolean).join(' ')} />
                  <LabelValue label="ที่อยู่" value={[quotation.customerSnapshot.address, quotation.customerSnapshot.subDistrict, quotation.customerSnapshot.district, quotation.customerSnapshot.province, quotation.customerSnapshot.postalCode].filter(Boolean).join(' ')} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ ...uiCardSx, overflow: 'hidden' }}>
              <DataTable
                sectionHeader={{ title: 'รายการ / Specification' }}
                columns={itemTableColumns}
                rows={quotation.items}
                getRowKey={(item, index) => `${item.productId ?? item.quickProductId ?? item.name}-${index}`}
                minWidth={720}
                stickyHeader={false}
                emptyState={{ title: 'ยังไม่มีรายการในใบเสนอราคา' }}
              />
            </Card>

            <Card sx={uiCardSx}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>เงื่อนไขและหมายเหตุ</Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  <LabelValue label="หัวเรื่อง" value={quotation.subject} />
                  <LabelValue label="หมายเหตุ" value={quotation.notes} />
                  <LabelValue label="Terms & Conditions" value={quotation.termsAndConditions} />
                  <LabelValue label="เงื่อนไขการชำระเงิน" value={quotation.paymentTerms} />
                  <LabelValue label="เงื่อนไขการส่งมอบ" value={quotation.deliveryTerms} />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={uiCardSx}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>Timeline</Typography>
                <Stack spacing={1.4} sx={{ mt: 1.5 }}>
                  {[...quotation.statusHistory].reverse().map((entry, index) => (
                    <Stack key={`${entry.timestamp}-${entry.action}-${index}`} direction="row" spacing={1.25} alignItems="flex-start">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: index === 0 ? 'primary.main' : '#CBD5E1', mt: 0.7, flexShrink: 0 }} />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap><QuotationStatusChip status={entry.status} /><Typography variant="caption" color="text.secondary">{formatQuotationDateTime(entry.timestamp)}</Typography></Stack>
                        <Typography variant="body2" sx={{ mt: 0.4 }}>โดย {entry.actor}{entry.reason ? ` · ${entry.reason}` : ''}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Card sx={{ ...uiCardSx, position: { lg: 'sticky' }, top: { lg: 20 } }}>
            <CardContent>
              <Stack spacing={1.4}>
                <Typography variant="h6" fontWeight={800}>สรุปยอด</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.8 }}>
                  <Typography color="text.secondary">Subtotal</Typography><Typography>{quotationMoney.format(quotation.subtotal)}</Typography>
                  <Typography color="text.secondary">ส่วนลด</Typography><Typography>-{quotationMoney.format(quotation.discount)}</Typography>
                  <Typography color="text.secondary">ยอดก่อน VAT</Typography><Typography>{quotationMoney.format(quotation.taxableAmount)}</Typography>
                  <Typography color="text.secondary">VAT {quotation.vatRate}%</Typography><Typography>{quotationMoney.format(quotation.vatAmount)}</Typography>
                </Box>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={900}>Grand Total</Typography><Typography sx={{ fontSize: 22, fontWeight: 900, color: '#1D4ED8' }}>{quotationMoney.format(quotation.grandTotal)}</Typography></Stack>
                <Alert severity={quotation.taxInvoiceRequested ? 'info' : 'success'}>{quotation.taxInvoiceRequested ? 'ลูกค้าร้องขอใบกำกับภาษี — Quotation นี้คำนวณ VAT ตามนโยบายปัจจุบัน แต่การ Convert จะยังไม่ออกเลขใบกำกับภาษี เลขเอกสารภาษีต้องออกผ่าน Order Tax Invoice flow โดยชัดเจนภายหลัง' : 'Quotation นี้ยังไม่ร้องขอใบกำกับภาษี'}</Alert>
                {quotation.convertedOrderId ? <LabelValue label="Converted Order ID" value={quotation.convertedOrderId} /> : null}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <Dialog open={dialog === 'approve' || dialog === 'reject' || dialog === 'revise' || dialog === 'cancel'} onClose={() => (acting ? undefined : setDialog(null))} fullWidth maxWidth="sm">
        <DialogTitle>{dialog === 'approve' ? 'บันทึกการอนุมัติจากลูกค้า' : dialog === 'reject' ? 'ปฏิเสธใบเสนอราคา' : dialog === 'revise' ? 'สร้างฉบับแก้ไข' : 'ยกเลิกใบเสนอราคา'}</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth multiline minRows={3} sx={{ mt: 1 }} label={dialog === 'approve' ? 'หมายเหตุการยืนยันจากลูกค้า' : dialog === 'revise' ? 'เหตุผล / หมายเหตุการแก้ไข' : 'เหตุผล'} required={dialog !== 'revise'} value={reason} onChange={event => setReason(event.target.value)} /></DialogContent>
        <DialogActions><Button onClick={() => setDialog(null)} disabled={acting}>กลับ</Button><Button variant="contained" color={dialog === 'reject' || dialog === 'cancel' ? 'error' : 'primary'} disabled={acting || (dialog !== 'revise' && !reason.trim())} onClick={() => void submitReasonAction()}>{acting ? 'กำลังบันทึก...' : 'ยืนยัน'}</Button></DialogActions>
      </Dialog>

      <Dialog open={dialog === 'convert'} onClose={() => (acting ? undefined : setDialog(null))} fullWidth maxWidth="sm">
        <DialogTitle>สร้าง Order จากใบเสนอราคา</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">ระบบจะสร้าง Order ใหม่จาก {quotation.quotationNumber} Rev.{quotation.revision} โดย Quotation และ Order จะเก็บ Snapshot แยกจากกันหลัง Convert</Alert>
            <LabelValue label="ลูกค้า" value={quotation.customerSnapshot.customerName} />
            <LabelValue label="ยอดรวม" value={quotationMoney.format(quotation.grandTotal)} />
            {conflicts.length > 0 ? (
              <Alert severity="warning">
                <Typography fontWeight={800}>พบ Price Conflict</Typography>
                {conflicts.map(conflict => <Typography key={`${conflict.index}-${conflict.name}`} variant="body2" sx={{ mt: 0.5 }}>{conflict.name}: ราคาเสนอ {quotationMoney.format(conflict.quotedUnitPrice)} → ราคาปัจจุบัน {quotationMoney.format(conflict.currentUnitPrice)}</Typography>)}
              </Alert>
            ) : null}
            {conflicts.length > 0 && canOverridePrice(role) ? <TextField required multiline minRows={2} label="เหตุผลยืนยันใช้ราคาเสนอ" value={reason} onChange={event => setReason(event.target.value)} /> : null}
            {conflicts.length > 0 && !canOverridePrice(role) ? <Alert severity="error">ต้องใช้สิทธิ์ Manager หรือ Admin เพื่อยืนยันใช้ราคาเสนอเดิม</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)} disabled={acting}>ยกเลิก</Button>
          <Button
            variant="contained"
            disabled={acting || (conflicts.length > 0 && (!canOverridePrice(role) || !reason.trim()))}
            onClick={() => void convert(conflicts.length > 0)}>
            {acting ? 'กำลังสร้าง Order...' : conflicts.length > 0 ? 'ยืนยันใช้ราคาเสนอและสร้าง Order' : 'ยืนยันสร้าง Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}
