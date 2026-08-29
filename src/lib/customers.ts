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

export function getCustomerPhoneNumbers(
  customer: Pick<CustomerProfile, 'phoneNumber' | 'phoneNumbers'>,
): string[] {
  return [...(customer.phoneNumbers ?? []), customer.phoneNumber]
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
    remainingTotal?: number;
    status?: string;
    workflowStatus?: string;
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

export async function fetchCustomers(search = '', limit = 20): Promise<CustomerProfile[]> {
  const query = new URLSearchParams({ limit: String(limit), active: 'true' });
  if (search.trim()) query.set('search', search.trim());
  const response = await fetchApiJson<{ data?: CustomerProfile[] }>(`/customers?${query.toString()}`);
  return Array.isArray(response.data) ? response.data : [];
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

export async function updateCustomer(id: string, payload: Partial<Omit<CustomerProfile, '_id' | 'customerCode'>>): Promise<CustomerProfile> {
  return fetchApiJson<CustomerProfile>(`/customers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
