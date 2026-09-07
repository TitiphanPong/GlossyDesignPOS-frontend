import { buildExportFilename, normalizeMonthScope } from './export-filename';

export type TaxInvoiceReviewReason = {
  code: string;
  label: string;
};

export type TaxInvoiceReportItem = {
  id: string;
  orderId: string;
  orderNumber: string;
  documentDate: string;
  invoicePeriod: string;
  invoicePeriodSource: 'invoicePeriod' | 'saleDate' | 'createdAt';
  invoiceNumber: string;
  bookNo: string;
  invoiceSequence: string;
  customerName: string;
  customerAddress: string;
  taxId: string;
  branch: string;
  subtotal: number;
  discount: number;
  taxableBase: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: string;
  note: string;
  status: string;
  reportStatus: 'issued' | 'needs_review' | 'cancelled_review';
  reviewReasons: TaxInvoiceReviewReason[];
  cancellation?: {
    cancelledAt: string;
    reason: string;
    correctiveDocumentRequired: boolean;
    correctiveDocumentStatus: 'not_required' | 'required';
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
};

export type CrossPeriodCancellation = {
  id: string;
  orderId: string;
  orderNumber: string;
  invoicePeriod: string;
  invoiceNumber: string;
  bookNo: string;
  invoiceSequence: string;
  customerName: string;
  taxId: string;
  branch: string;
  taxableBase: number;
  vatAmount: number;
  grandTotal: number;
  cancellation: {
    cancelledAt: string;
    reason: string;
    correctiveDocumentRequired: boolean;
    correctiveDocumentStatus: 'not_required' | 'required';
  };
};

export type TaxInvoiceMonthlyReport = {
  period: string;
  periodLabel: string;
  generatedAt: string;
  timezone: 'Asia/Bangkok';
  summary: {
    documentCount: number;
    taxableBase: number;
    vatAmount: number;
    grandTotal: number;
    cancelledCount: number;
    cancelledOriginalTotals: {
      taxableBase: number;
      vatAmount: number;
      grandTotal: number;
    };
    reviewCount: number;
    crossPeriodCancellationCount: number;
  };
  documents: TaxInvoiceReportItem[];
  crossPeriodCancellations: CrossPeriodCancellation[];
};

export type TaxInvoiceExportKind = 'excel' | 'summary-pdf' | 'invoices-pdf';

export type TaxInvoiceExportFailure = {
  orderId: string;
  invoiceNumber: string;
  reasons: string[];
};

export class TaxInvoiceExportError extends Error {
  failures: TaxInvoiceExportFailure[];

  constructor(message: string, failures: TaxInvoiceExportFailure[] = []) {
    super(message);
    this.name = 'TaxInvoiceExportError';
    this.failures = failures;
  }
}

const BANGKOK_TIMEZONE = 'Asia/Bangkok';
const MONTH_PATTERN = /^\d{6}$/;

function assertPeriod(period: string): void {
  if (!MONTH_PATTERN.test(period)) throw new TypeError('period must use YYYYMM format');
  const month = Number(period.slice(4, 6));
  if (month < 1 || month > 12) throw new TypeError('period contains an invalid month');
}

export function getPreviousBangkokPeriod(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BANGKOK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  let year = Number(parts.find(part => part.type === 'year')?.value ?? 0);
  let month = Number(parts.find(part => part.type === 'month')?.value ?? 0) - 1;
  if (month === 0) {
    year -= 1;
    month = 12;
  }
  return `${String(year).padStart(4, '0')}${String(month).padStart(2, '0')}`;
}

export function createTaxInvoicePeriod(year: number, month: number): string {
  if (!Number.isInteger(year) || year < 1900 || year > 2500) throw new TypeError('invalid year');
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new TypeError('invalid month');
  return `${year}${String(month).padStart(2, '0')}`;
}

export function filterTaxInvoiceDocuments(
  documents: TaxInvoiceReportItem[],
  query: string,
): TaxInvoiceReportItem[] {
  const normalized = query.trim().toLocaleLowerCase('th-TH');
  if (!normalized) return documents;
  return documents.filter(document =>
    [document.invoiceNumber, document.orderNumber, document.customerName, document.taxId]
      .join('\n')
      .toLocaleLowerCase('th-TH')
      .includes(normalized)
  );
}

export function formatTaxReportMoney(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatTaxReportDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: BANGKOK_TIMEZONE,
  }).format(date);
}

export function formatTaxReportDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: BANGKOK_TIMEZONE,
  }).format(date);
}

export async function fetchTaxInvoiceMonthlyReport(
  period: string,
  signal?: AbortSignal,
): Promise<TaxInvoiceMonthlyReport> {
  assertPeriod(period);
  const response = await fetch(`/api/backend/reports/tax-invoices?period=${encodeURIComponent(period)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(payload?.message || 'โหลดรายงานใบกำกับภาษีไม่สำเร็จ');
  }
  return response.json() as Promise<TaxInvoiceMonthlyReport>;
}

function exportPath(kind: TaxInvoiceExportKind): string {
  if (kind === 'excel') return 'excel';
  if (kind === 'summary-pdf') return 'summary-pdf';
  return 'invoices-pdf';
}

function filenameFromDisposition(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const encoded = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  const plain = value.match(/filename="?([^";]+)"?/i)?.[1];
  return plain?.trim() || fallback;
}

export async function downloadTaxInvoiceMonthlyExport(
  period: string,
  kind: TaxInvoiceExportKind,
): Promise<{ filename: string }> {
  assertPeriod(period);
  const response = await fetch(
    `/api/backend/reports/tax-invoices/export/${exportPath(kind)}?period=${encodeURIComponent(period)}`,
    { credentials: 'same-origin', cache: 'no-store' },
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as {
      message?: string;
      failedDocuments?: TaxInvoiceExportFailure[];
    } | null;
    throw new TaxInvoiceExportError(
      payload?.message || 'ดาวน์โหลดรายงานไม่สำเร็จ',
      payload?.failedDocuments ?? [],
    );
  }
  const blob = await response.blob();
  const fallback = buildExportFilename({
    artifact: 'tax-invoices',
    variant: kind === 'summary-pdf' ? 'summary' : undefined,
    scope: normalizeMonthScope(period),
    extension: kind === 'excel' ? 'xlsx' : 'pdf',
  });
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), fallback);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return { filename };
}
