import { fetchApiJson } from './api';

export type CustomerProfile = {
  _id: string;
  customerCode: string;
  displayName: string;
  phoneNumber?: string;
  phoneNumbers?: string[];
  email?: string;
  taxId?: string;
  companyName?: string;
  address?: string;
  branchType?: string;
  branchNo?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  shippingAddress?: string;
  active: boolean;
};

export type CustomerListResult = {
  data: CustomerProfile[];
  page: number;
  limit: number;
  total: number;
};

export type CustomerListOptions = {
  search?: string;
  page?: number;
  limit?: number;
  active?: boolean;
};

export function getCustomerPhoneNumbers(
  customer: Pick<CustomerProfile, 'phoneNumber' | 'phoneNumbers'>,
): string[] {
  return [customer.phoneNumber, ...(customer.phoneNumbers ?? [])]
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter((value, index, values) => value && values.indexOf(value) === index);
}

export function getPrimaryCustomerPhoneNumber(
  customer: Pick<CustomerProfile, 'phoneNumber' | 'phoneNumbers'>,
): string {
  return getCustomerPhoneNumbers(customer)[0] ?? '';
}

export function formatCustomerPhoneNumbers(
  customer: Pick<CustomerProfile, 'phoneNumber' | 'phoneNumbers'>,
): string {
  return getCustomerPhoneNumbers(customer).join(', ');
}

export function parseCustomerPhoneInput(value: string): string[] {
  return value
    .split(/[,;\r\n]+/)
    .map(phone => phone.trim().replace(/\s+/g, ' '))
    .filter((phone, index, phones) => phone && phones.indexOf(phone) === index);
}

export type CustomerDetail = {
  customer: CustomerProfile;
  summary: { orderCount: number; outstandingTotal: number };
  orders: Array<{
    _id: string;
    orderNumber?: string;
    orderId?: string;
    saleDate?: string;
    createdAt?: string;
    grandTotal?: number;
    paidAmount?: number;
    remainingTotal?: number;
    status?: string;
    workflowStatus?: string;
    taxInvoice?: string;
  }>;
  activeProductionJobs: Array<{
    _id: string;
    jobNumber: string;
    orderNumber: string;
    workSummary: string;
    dueAt: string;
    priority: string;
    stage: string;
  }>;
  linkedUploads: Array<{
    _id: string;
    uploadId: string;
    orderCode: string;
    linkedOrderNumber?: string;
    jobType: string;
    status: string;
  }>;
};

export async function fetchCustomersPage(options: CustomerListOptions = {}): Promise<CustomerListResult> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 20),
  });
  if (options.search?.trim()) query.set('search', options.search.trim());
  if (options.active !== undefined) query.set('active', String(options.active));

  const response = await fetchApiJson<Partial<CustomerListResult>>(`/customers?${query.toString()}`);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page: Number(response.page ?? options.page ?? 1),
    limit: Number(response.limit ?? options.limit ?? 20),
    total: Number(response.total ?? 0),
  };
}

export async function fetchCustomers(search = '', limit = 20): Promise<CustomerProfile[]> {
  const response = await fetchCustomersPage({ search, limit, active: true });
  return response.data;
}

export async function fetchCustomerDetail(id: string): Promise<CustomerDetail> {
  return fetchApiJson<CustomerDetail>(`/customers/${encodeURIComponent(id)}`, { cache: 'no-store' });
}

export async function createCustomer(payload: Omit<CustomerProfile, '_id' | 'customerCode' | 'active'>): Promise<CustomerProfile> {
  return fetchApiJson<CustomerProfile>('/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

type CustomerClearableField =
  | 'email'
  | 'taxId'
  | 'companyName'
  | 'address'
  | 'branchType'
  | 'branchNo'
  | 'subDistrict'
  | 'district'
  | 'province'
  | 'postalCode'
  | 'shippingAddress';

export type CustomerUpdatePayload = Partial<
  Omit<CustomerProfile, '_id' | 'customerCode' | CustomerClearableField>
> &
  Partial<Record<CustomerClearableField, string | null>>;

export async function updateCustomer(id: string, payload: CustomerUpdatePayload): Promise<CustomerProfile> {
  return fetchApiJson<CustomerProfile>(`/customers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
