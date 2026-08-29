import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOrderCustomerSnapshot } from './customer-order';

test('walk-in checkout keeps the order unlinked to a customer profile', () => {
  assert.deepEqual(buildOrderCustomerSnapshot(null), {
    customerName: 'ลูกค้าหน้าร้าน',
    phoneNumber: '',
    note: '',
  });
});

test('selected customer checkout keeps customerId and immutable order snapshot fields', () => {
  assert.deepEqual(
    buildOrderCustomerSnapshot({
      _id: '64b0000000000000000000cc',
      customerCode: 'CUS-E2E',
      displayName: 'บริษัท E2E จำกัด',
      phoneNumber: '0812345678',
      email: 'customer@example.com',
      taxId: '0105555555555',
      address: '99 ถนนสุขุมวิท กรุงเทพฯ',
      active: true,
    }),
    {
      customerId: '64b0000000000000000000cc',
      customerName: 'บริษัท E2E จำกัด',
      phoneNumber: '0812345678',
      taxId: '0105555555555',
      address: '99 ถนนสุขุมวิท กรุงเทพฯ',
      note: '',
    }
  );
});
