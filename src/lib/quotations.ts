import { buildApiUrl } from './api';

export const QUOTATION_STATUSES = [
  'DRAFT',
  'SENT',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'CONVERTED',
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export type QuotationCustomerSnapshot = {
  customerName?: string;
  phoneNumber?: string;
  email?: string;
  taxId?: string;
  branchType?: string;
  branchNo?: string;
  address?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
};

export type QuotationItem = {
  productId?: string;
  variantId?: string;
  quickProductId?: string;
  productCode?: string;
  typeCode?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  authoritativeUnitPrice: number;
  lineTotal: number;
  priceOverride?: {
    unitPrice: number;
    reason: string;
    approvedBy: string;
    approvedAt: string;
  };
  variantName?: string;
  material?: string;
  colorMode?: string;
  size?: string;
  sides?: string;
  productNote?: string;
  note?: string;
};

export type QuotationStatusHistoryEntry = {
  status: QuotationStatus;
  action: string;
  actor: string;
  timestamp: string;
  reason?: string;
};

export type QuotationRevisionSnapshot = {
  revision: number;
  status: QuotationStatus;
  quotationNumber?: string;
  issuedAt?: string;
  validUntil?: string;
  customerSnapshot: QuotationCustomerSnapshot;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  taxInvoiceRequested: boolean;
  currency: 'THB';
  subject?: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  internalNote?: string;
  snapshotBy: string;
  snapshotAt: string;
};

export type Quotation = {
  _id: string;
  quotationNumber?: string;
  revision: number;
  status: QuotationStatus;
  storedStatus: QuotationStatus;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  issuedAt?: string;
  validUntil?: string;
  createdBy: string;
  updatedBy: string;
  customerId?: string;
  customerSnapshot: QuotationCustomerSnapshot;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  discountType?: 'amount' | 'percent';
  discountValue?: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  taxInvoiceRequested: boolean;
  currency: 'THB';
  subject?: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  internalNote?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  convertedOrderId?: string;
  convertedAt?: string;
  convertedBy?: string;
  statusHistory: QuotationStatusHistoryEntry[];
  revisionHistory: QuotationRevisionSnapshot[];
};

export type QuotationSummary = {
  draft: number;
  sent: number;
  approved: number;
  expired: number;
  expiring: number;
  expiringOrExpired: number;
};

export type QuotationListResult = {
  data: Quotation[];
  page: number;
  limit: number;
  total: number;
  summary: QuotationSummary;
};

export type QuotationItemRequest = {
  productId?: string;
  variantId?: string;
  quickProductId?: string;
  productCode?: string;
  typeCode?: string;
  variantName?: string;
  customName?: string;
  description?: string;
  quantity: number;
  unit?: string;
  priceOverride?: { unitPrice: number; reason: string };
  material?: string;
  colorMode?: string;
  size?: string;
  sides?: string;
  productNote?: string;
  note?: string;
};

export type QuotationDraftPayload = {
  customerId?: string;
  customerSnapshot?: QuotationCustomerSnapshot;
  items?: QuotationItemRequest[];
  discount?: { type: 'amount' | 'percent'; value: number };
  taxInvoiceRequested?: boolean;
  validUntil?: string;
  subject?: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  internalNote?: string;
};

export type QuotationListOptions = {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus | 'all';
  customerId?: string;
  issuedFrom?: string;
  issuedTo?: string;
  validFrom?: string;
  validTo?: string;
  sort?: 'newest' | 'oldest' | 'validUntilAsc' | 'validUntilDesc' | 'amountDesc' | 'amountAsc';
};

export type QuotationConversionConflict = {
  index: number;
  name: string;
  quotedUnitPrice: number;
  currentUnitPrice: number;
};

export class QuotationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly conflicts: QuotationConversionConflict[] = [],
  ) {
    super(message);
    this.name = 'QuotationApiError';
  }
}

function readMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { message?: unknown }).message;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate)) return candidate.filter(item => typeof item === 'string').join(', ');
  }
  return fallback;
}

async function quotationRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const payload = await response.clone().json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      const target = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?redirectTo=${encodeURIComponent(target)}`);
    }
    const objectPayload = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    const code = typeof objectPayload.code === 'string' ? objectPayload.code : undefined;
    const conflicts = Array.isArray(objectPayload.conflicts)
      ? objectPayload.conflicts.filter((value): value is QuotationConversionConflict => {
          if (!value || typeof value !== 'object') return false;
          const row = value as Record<string, unknown>;
          return typeof row.name === 'string' && typeof row.quotedUnitPrice === 'number' && typeof row.currentUnitPrice === 'number';
        })
      : [];
    throw new QuotationApiError(
      readMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      code,
      conflicts,
    );
  }
  return payload as T;
}

export async function fetchQuotations(options: QuotationListOptions = {}): Promise<QuotationListResult> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 20),
    sort: options.sort ?? 'newest',
  });
  if (options.search?.trim()) params.set('search', options.search.trim());
  if (options.status && options.status !== 'all') params.set('status', options.status);
  if (options.customerId) params.set('customerId', options.customerId);
  if (options.issuedFrom) params.set('issuedFrom', options.issuedFrom);
  if (options.issuedTo) params.set('issuedTo', options.issuedTo);
  if (options.validFrom) params.set('validFrom', options.validFrom);
  if (options.validTo) params.set('validTo', options.validTo);
  return quotationRequest<QuotationListResult>(`/quotations?${params.toString()}`);
}

export function fetchQuotation(id: string): Promise<Quotation> {
  return quotationRequest<Quotation>(`/quotations/${encodeURIComponent(id)}`);
}

export function createQuotation(payload: QuotationDraftPayload): Promise<Quotation> {
  return quotationRequest<Quotation>('/quotations', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateQuotation(id: string, version: number, payload: QuotationDraftPayload): Promise<Quotation> {
  return quotationRequest<Quotation>(`/quotations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...payload, version }),
  });
}

function command(id: string, action: string, version: number, extra: Record<string, unknown> = {}): Promise<Quotation> {
  return quotationRequest<Quotation>(`/quotations/${encodeURIComponent(id)}/${action}`, {
    method: 'POST',
    body: JSON.stringify({ version, ...extra }),
  });
}

export function sendQuotation(id: string, version: number): Promise<Quotation> {
  return command(id, 'send', version);
}

export function approveQuotation(id: string, version: number, reason?: string): Promise<Quotation> {
  return command(id, 'approve', version, reason ? { reason } : {});
}

export function rejectQuotation(id: string, version: number, reason: string): Promise<Quotation> {
  return command(id, 'reject', version, { reason });
}

export function reviseQuotation(id: string, version: number, reason?: string): Promise<Quotation> {
  return command(id, 'revise', version, reason ? { reason } : {});
}

export function cancelQuotation(id: string, version: number, reason: string): Promise<Quotation> {
  return command(id, 'cancel', version, { reason });
}

export type ConvertQuotationResult = {
  quotation: Quotation;
  order: {
    _id: string;
    orderId: string;
    orderNumber?: string;
    status: string;
    workflowStatus?: string;
    grandTotal: number;
    remainingTotal: number;
    quotationId?: string;
    quotationNumber?: string;
    quotationRevision?: number;
  };
  replayed: boolean;
};

export function convertQuotationToOrder(
  id: string,
  version: number,
  options: { confirmQuotedPrice?: boolean; priceConflictReason?: string; reason?: string } = {},
): Promise<ConvertQuotationResult> {
  const idempotencyKey = `quotation-convert-${id}-${version}`;
  return quotationRequest<ConvertQuotationResult>(`/quotations/${encodeURIComponent(id)}/convert-to-order`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ version, ...options }),
  });
}
