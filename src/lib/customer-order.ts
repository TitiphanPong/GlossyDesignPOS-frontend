import { getPrimaryCustomerPhoneNumber, type CustomerProfile } from './customers';

export type OrderCustomerSnapshot = {
  customerId?: string;
  customerName: string;
  phoneNumber: string;
  taxId?: string;
  address?: string;
  note: string;
};

export function buildOrderCustomerSnapshot(customer: CustomerProfile | null): OrderCustomerSnapshot {
  if (!customer) {
    return {
      customerName: 'ลูกค้าหน้าร้าน',
      phoneNumber: '',
      note: '',
    };
  }

  return {
    customerId: customer._id,
    customerName: customer.displayName.trim() || 'ลูกค้าหน้าร้าน',
    phoneNumber: getPrimaryCustomerPhoneNumber(customer),
    taxId: customer.taxId?.trim() || undefined,
    address: customer.address?.trim() || undefined,
    note: '',
  };
}
