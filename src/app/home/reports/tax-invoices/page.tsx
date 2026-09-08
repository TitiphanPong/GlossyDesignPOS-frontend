'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AdminPageContainer from '../../components/AdminPageContainer';
import AdminHeroHeader, { heroPrimaryButtonSx, heroSecondaryButtonSx, heroUtilityButtonSx } from '../../components/AdminHeroHeader';
import DataTable, { type DataTableColumn } from '../../components/DataTable';
import ReportFilterPanel from '../../components/ReportFilterPanel';
import { uiCardSx } from '../../components/adminUi';
import {
  CrossPeriodCancellation,
  TaxInvoiceExportError,
  TaxInvoiceExportKind,
  TaxInvoiceMonthlyReport,
  TaxInvoiceReportItem,
  createTaxInvoicePeriod,
  downloadTaxInvoiceMonthlyExport,
  fetchTaxInvoiceMonthlyReport,
  filterTaxInvoiceDocuments,
  formatTaxReportDate,
  formatTaxReportMoney,
  getPreviousBangkokPeriod,
} from '@/lib/tax-invoice-reports';

const MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

function bangkokYear(now = new Date()): number {
  const year = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
  }).format(now);
  return Number(year);
}

function summaryCard(label: string, value: React.ReactNode, helper: string, tone: 'default' | 'warning' | 'danger' = 'default') {
  const toneStyles = {
    default: { bgcolor: '#FFFFFF', borderColor: '#E6EDF8', valueColor: '#101828' },
    warning: { bgcolor: '#FFFCF5', borderColor: '#FEDF89', valueColor: '#B54708' },
    danger: { bgcolor: '#FFF8F8', borderColor: '#FECDCA', valueColor: '#B42318' },
  }[tone];
  return (
    <Card sx={{ ...uiCardSx, bgcolor: toneStyles.bgcolor, borderColor: toneStyles.borderColor, boxShadow: 'none' }}>
      <CardContent sx={{ p: 2.1, '&:last-child': { pb: 2.1 } }}>
        <Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 700 }}>{label}</Typography>
        <Typography sx={{ mt: 0.7, fontSize: 24, lineHeight: 1.15, fontWeight: 800, color: toneStyles.valueColor }}>{value}</Typography>
        <Typography sx={{ mt: 0.7, fontSize: 11.5, color: '#98A2B3' }}>{helper}</Typography>
      </CardContent>
    </Card>
  );
}

function reportStatusChip(row: TaxInvoiceReportItem) {
  if (row.reportStatus === 'cancelled_review') {
    return <Chip size="small" color="error" variant="outlined" label="ยกเลิก · ต้องตรวจเอกสาร" />;
  }
  if (row.reportStatus === 'needs_review') {
    return <Chip size="small" color="warning" variant="outlined" label="ต้องตรวจสอบ" />;
  }
  return <Chip size="small" color="success" variant="outlined" label="ออกเอกสารแล้ว" />;
}

function reportColumns(onOpen: (row: TaxInvoiceReportItem) => void): DataTableColumn<TaxInvoiceReportItem>[] {
  return [
    { key: 'date', header: 'วันที่เอกสาร', width: 120, render: row => formatTaxReportDate(row.documentDate) },
    { key: 'book', header: 'เล่มที่', width: 80, render: row => row.bookNo || '-' },
    {
      key: 'invoice',
      header: 'เลขที่ใบกำกับ',
      width: 190,
      render: row => <Typography sx={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.invoiceNumber || '-'}</Typography>,
    },
    {
      key: 'order',
      header: 'เลขที่งาน',
      width: 190,
      render: row => <Typography sx={{ fontSize: 13, minWidth: 150, whiteSpace: 'nowrap' }}>{row.orderNumber || '-'}</Typography>,
    },
    {
      key: 'customer',
      header: 'ลูกค้า / บริษัท',
      width: 220,
      render: row => <Typography sx={{ fontSize: 13, minWidth: 160 }}>{row.customerName || '-'}</Typography>,
    },
    { key: 'taxId', header: 'เลขผู้เสียภาษี', width: 150, render: row => row.taxId || '-' },
    {
      key: 'base',
      header: 'ก่อน VAT หลังส่วนลด',
      align: 'right',
      width: 145,
      render: row => formatTaxReportMoney(row.taxableBase),
    },
    { key: 'vat', header: 'VAT', align: 'right', width: 110, render: row => formatTaxReportMoney(row.vatAmount) },
    { key: 'total', header: 'ยอดรวม', align: 'right', width: 120, render: row => <strong>{formatTaxReportMoney(row.grandTotal)}</strong> },
    {
      key: 'status',
      header: 'สถานะ',
      width: 190,
      render: row => (
        <Tooltip title={row.reviewReasons.map(reason => reason.label).join(' · ') || 'ข้อมูลเอกสารครบ'}>
          <Box component="span">{reportStatusChip(row)}</Box>
        </Tooltip>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 72,
      render: row => (
        <Tooltip title="เปิดใบกำกับภาษี">
          <Button
            size="small"
            aria-label={`เปิดใบกำกับ ${row.invoiceNumber || row.orderNumber}`}
            onClick={event => {
              event.stopPropagation();
              onOpen(row);
            }}
            sx={{ minWidth: 38, px: 1 }}>
            <VisibilityRoundedIcon fontSize="small" />
          </Button>
        </Tooltip>
      ),
    },
  ];
}

const crossPeriodColumns: DataTableColumn<CrossPeriodCancellation>[] = [
  { key: 'cancelledAt', header: 'วันที่ยกเลิก', width: 130, render: row => formatTaxReportDate(row.cancellation.cancelledAt) },
  { key: 'period', header: 'งวดเดิม', width: 100, render: row => row.invoicePeriod },
  { key: 'book', header: 'เล่มที่', width: 80, render: row => row.bookNo || '-' },
  { key: 'invoice', header: 'เลขที่ใบกำกับ', width: 190, render: row => row.invoiceNumber || '-' },
  {
    key: 'order',
    header: 'เลขที่งาน',
    width: 190,
    render: row => <Typography sx={{ fontSize: 13, minWidth: 150, whiteSpace: 'nowrap' }}>{row.orderNumber}</Typography>,
  },
  { key: 'customer', header: 'ลูกค้า / บริษัท', width: 220, render: row => row.customerName },
  { key: 'vat', header: 'VAT เดิม', width: 110, align: 'right', render: row => formatTaxReportMoney(row.vatAmount) },
  { key: 'total', header: 'ยอดรวมเดิม', width: 130, align: 'right', render: row => formatTaxReportMoney(row.grandTotal) },
  { key: 'reason', header: 'เหตุผลยกเลิก', width: 260, render: row => row.cancellation.reason },
];

export default function TaxInvoiceMonthlyReportPage() {
  const [period, setPeriod] = React.useState(() => getPreviousBangkokPeriod());
  const [report, setReport] = React.useState<TaxInvoiceMonthlyReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [downloading, setDownloading] = React.useState<TaxInvoiceExportKind | null>(null);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  const selectedYear = Number(period.slice(0, 4));
  const selectedMonth = Number(period.slice(4, 6));
  const currentYear = bangkokYear();
  const yearOptions = React.useMemo(() => {
    const years = new Set<number>();
    for (let year = currentYear - 5; year <= currentYear + 1; year += 1) years.add(year);
    years.add(selectedYear);
    return [...years].sort((left, right) => right - left);
  }, [currentYear, selectedYear]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    setDownloadError(null);
    void fetchTaxInvoiceMonthlyReport(period, controller.signal)
      .then(data => {
        setReport(data);
        setLoadError(null);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setReport(null);
        setLoadError(error instanceof Error ? error.message : 'โหลดรายงานใบกำกับภาษีไม่สำเร็จ');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [period, reloadKey]);

  React.useEffect(() => {
    setPage(0);
  }, [period, query, rowsPerPage]);

  const filteredDocuments = React.useMemo(
    () => filterTaxInvoiceDocuments(report?.documents ?? [], query),
    [query, report?.documents]
  );
  const pagedDocuments = React.useMemo(
    () => filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredDocuments, page, rowsPerPage]
  );

  const openInvoice = React.useCallback((row: TaxInvoiceReportItem) => {
    const target = `/print/invoice/${encodeURIComponent(row.id)}?documentType=tax-invoice`;
    globalThis.open(target, '_blank', 'noopener,noreferrer');
  }, []);
  const columns = React.useMemo(() => reportColumns(openInvoice), [openInvoice]);

  const handleDownload = async (kind: TaxInvoiceExportKind) => {
    setDownloading(kind);
    setDownloadError(null);
    setDownloadNotice(null);
    try {
      const result = await downloadTaxInvoiceMonthlyExport(period, kind);
      setDownloadNotice(`ดาวน์โหลด ${result.filename} แล้ว · ไฟล์นี้รวมทั้งเดือน ${report?.periodLabel ?? period}`);
    } catch (error) {
      if (error instanceof TaxInvoiceExportError && error.failures.length > 0) {
        const details = error.failures
          .map(item => `${item.invoiceNumber || item.orderId}: ${item.reasons.join(', ')}`)
          .join(' · ');
        setDownloadError(`${error.message} — ${details}`);
      } else {
        setDownloadError(error instanceof Error ? error.message : 'ดาวน์โหลดรายงานไม่สำเร็จ');
      }
    } finally {
      setDownloading(null);
    }
  };

  const summary = report?.summary;
  const canDownload = Boolean(report) && !loading && !loadError && !downloading;

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="ใบกำกับภาษีรายเดือน"
        description="ตรวจความครบถ้วนของใบกำกับภาษีและรวบรวมเอกสารทั้งเดือนเพื่อส่งสำนักงานบัญชี"
        lastSyncedAt={report?.generatedAt}
        utilityActions={
          <Button
            variant="text"
            startIcon={<RefreshRoundedIcon />}
            sx={heroUtilityButtonSx}
            disabled={loading}
            onClick={() => setReloadKey(value => value + 1)}>
            {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
          </Button>
        }
        secondaryActions={
          <>
            <Button
              variant="outlined"
              startIcon={<DescriptionRoundedIcon />}
              sx={heroSecondaryButtonSx}
              disabled={!canDownload}
              onClick={() => void handleDownload('excel')}>
              {downloading === 'excel' ? 'กำลังสร้าง…' : 'ดาวน์โหลด Excel'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfRoundedIcon />}
              sx={heroSecondaryButtonSx}
              disabled={!canDownload}
              onClick={() => void handleDownload('summary-pdf')}>
              {downloading === 'summary-pdf' ? 'กำลังสร้าง…' : 'ดาวน์โหลด PDF สรุป'}
            </Button>
          </>
        }
        primaryAction={
          <Button
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            sx={heroPrimaryButtonSx}
            disabled={!canDownload}
            onClick={() => void handleDownload('invoices-pdf')}>
            {downloading === 'invoices-pdf' ? 'กำลังสร้าง…' : 'ดาวน์โหลดใบกำกับทั้งเดือน'}
          </Button>
        }
      />

      <Stack spacing={2.2}>
        <ReportFilterPanel
          subtitle={report ? `งวดรายงาน ${report.periodLabel} · ค้นหาใบกำกับภาษีในเดือนที่เลือก` : 'เลือกงวดรายงานและค้นหาใบกำกับภาษีในเดือนที่เลือก'}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="ค้นหาเลขใบกำกับ เลขที่งาน ลูกค้า หรือเลขผู้เสียภาษี"
          inlineFilters
          onReset={() => setQuery('')}
          resetDisabled={!query}
          resetLabel="ล้างคำค้น"
          filters={[
            {
              id: 'tax-report-month',
              label: 'เดือน',
              value: String(selectedMonth),
              options: MONTHS.map((month, index) => ({ value: String(index + 1), label: month })),
              onChange: value => setPeriod(createTaxInvoicePeriod(selectedYear, Number(value))),
              minWidth: 170,
            },
            {
              id: 'tax-report-year',
              label: 'ปี พ.ศ.',
              value: String(selectedYear),
              options: yearOptions.map(year => ({ value: String(year), label: String(year + 543) })),
              onChange: value => setPeriod(createTaxInvoicePeriod(Number(value), selectedMonth)),
              minWidth: 145,
            },
          ]}>
          <Alert severity="info">
            ปุ่มดาวน์โหลดทุกปุ่มส่งออก <strong>ทั้งเดือนที่เลือก</strong> เสมอ ไม่จำกัดตามหน้าตาราง คำค้น หรือจำนวนแถวที่กำลังแสดง
          </Alert>
        </ReportFilterPanel>

        {loadError ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setReloadKey(value => value + 1)}>ลองใหม่</Button>}>
            {loadError}
          </Alert>
        ) : null}
        {downloadError ? <Alert severity="error" onClose={() => setDownloadError(null)}>{downloadError}</Alert> : null}
        {downloadNotice ? <Alert severity="success" onClose={() => setDownloadNotice(null)}>{downloadNotice}</Alert> : null}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, gap: 1.5 }}>
          {summaryCard('จำนวนใบกำกับ', loading ? '…' : summary?.documentCount ?? 0, 'เอกสารในงวดที่เลือก')}
          {summaryCard('ก่อน VAT หลังส่วนลด', loading ? '…' : formatTaxReportMoney(summary?.taxableBase ?? 0), 'บาท · ตามยอดที่บันทึกในเอกสาร')}
          {summaryCard('ภาษี VAT', loading ? '…' : formatTaxReportMoney(summary?.vatAmount ?? 0), 'บาท · ไม่ผูกกับยอดรับชำระ')}
          {summaryCard('ยอดรวมตามเอกสาร', loading ? '…' : formatTaxReportMoney(summary?.grandTotal ?? 0), 'บาท · รวมเอกสารยกเลิกตามยอดเดิม')}
          {summaryCard('ออเดอร์ยกเลิก', loading ? '…' : summary?.cancelledCount ?? 0, 'ต้องตรวจเอกสารปรับปรุง', (summary?.cancelledCount ?? 0) > 0 ? 'danger' : 'default')}
          {summaryCard('รายการต้องตรวจสอบ', loading ? '…' : summary?.reviewCount ?? 0, `ยกเลิกข้ามงวด ${summary?.crossPeriodCancellationCount ?? 0}`, (summary?.reviewCount ?? 0) > 0 ? 'warning' : 'default')}
        </Box>

        {(summary?.cancelledCount ?? 0) > 0 ? (
          <Alert severity="warning" icon={<WarningAmberRoundedIcon />}>
            เอกสารยกเลิกยังแสดงยอดเดิมในรายงาน: ฐานภาษี {formatTaxReportMoney(summary?.cancelledOriginalTotals.taxableBase ?? 0)} · VAT {formatTaxReportMoney(summary?.cancelledOriginalTotals.vatAmount ?? 0)} · รวม {formatTaxReportMoney(summary?.cancelledOriginalTotals.grandTotal ?? 0)} บาท ระบบ <strong>ไม่หัก VAT อัตโนมัติและไม่ถือว่าเป็นใบลดหนี้</strong>
          </Alert>
        ) : null}

        <Card sx={{ ...uiCardSx, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            rows={pagedDocuments}
            getRowKey={row => row.id}
            onRowClick={openInvoice}
            minWidth={1390}
            maxHeight="64vh"
            loading={loading}
            skeletonRowCount={8}
            sectionHeader={{
              title: 'ใบกำกับภาษีในงวด',
              subtitle: query ? `ผลการค้นหา ${filteredDocuments.length} จาก ${report?.documents.length ?? 0} ฉบับ · การค้นหาไม่มีผลต่อไฟล์ดาวน์โหลด` : 'เรียงตามเลขเล่มและเลขลำดับจากน้อยไปมาก',
              countLabel: `${report?.documents.length ?? 0} ฉบับ`,
            }}
            emptyState={{
              icon: <ReceiptLongRoundedIcon />,
              eyebrow: query ? 'Search' : 'No documents',
              title: query ? 'ไม่พบเอกสารที่ตรงกับคำค้น' : 'ไม่พบใบกำกับภาษีในเดือนนี้',
              subtitle: query ? 'ลองค้นหาด้วยเลขใบกำกับ เลขที่งาน ชื่อลูกค้า หรือเลขผู้เสียภาษี' : 'ยังสามารถดาวน์โหลด Excel หรือ PDF สรุปสำหรับงวดว่างได้',
            }}
            pagination={{
              count: filteredDocuments.length,
              page,
              rowsPerPage,
              onPageChange: setPage,
              onRowsPerPageChange: setRowsPerPage,
              rowsPerPageOptions: [10, 25, 50, 100],
            }}
          />
        </Card>

        <Card sx={{ ...uiCardSx, overflow: 'hidden' }}>
          <DataTable
            columns={crossPeriodColumns}
            rows={report?.crossPeriodCancellations ?? []}
            getRowKey={row => `${row.id}-${row.cancellation.cancelledAt}`}
            minWidth={1220}
            loading={loading}
            skeletonRowCount={3}
            sectionHeader={{
              title: 'ออเดอร์ใบกำกับงวดก่อนที่ยกเลิกในเดือนนี้',
              subtitle: 'อ้างอิงวันที่ยกเลิก แสดงเพื่อให้นักบัญชีเห็นเหตุการณ์ข้ามเดือน และไม่รวมซ้ำในยอดเอกสารงวดนี้',
              countLabel: `${report?.crossPeriodCancellations.length ?? 0} รายการ`,
            }}
            emptyState={{
              eyebrow: 'Cross-period',
              title: 'ไม่พบการยกเลิกใบกำกับจากงวดก่อน',
              subtitle: 'เดือนที่เลือกไม่มีเหตุการณ์ยกเลิกข้ามงวดที่ต้องติดตาม',
            }}
          />
        </Card>
      </Stack>
    </AdminPageContainer>
  );
}
