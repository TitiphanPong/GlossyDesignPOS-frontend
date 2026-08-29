import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAddedVat, calculateChange, calculatePayableTotal, calculateQuickSale, canConfirmQuickSalePayment, isDefaultVariantName, validateQuickSaleBackdate } from './quickSale';
import { computeTotals } from '../../utils/computeTotal';

test('quick sale calculates amount and percentage discounts safely', () => {
  assert.deepEqual(calculateQuickSale(350, 50, 'amount'), { subtotal: 350, discount: 50, grandTotal: 300 });
  assert.deepEqual(calculateQuickSale(350, 10, 'percent'), { subtotal: 350, discount: 35, grandTotal: 315 });
  assert.equal(calculateQuickSale(100, 200, 'amount').grandTotal, 0);
});

test('POS and Quick Sale add VAT only for tax invoices', () => {
  const net = calculateQuickSale(250, 25, 'amount');
  assert.equal(calculatePayableTotal(net.grandTotal, 'no'), 225);
  assert.equal(calculatePayableTotal(net.grandTotal, 'yes'), 240.75);
  assert.equal(calculateAddedVat(net.grandTotal), 15.75);
});

test('POS and Quick Sale stay in satang parity across representative rounding cases', () => {
  for (let satang = 1; satang <= 10_000; satang += 37) {
    const unitPrice = satang / 100;
    const quick = calculateQuickSale(unitPrice * 3, 0, 'amount');
    for (const taxInvoice of ['no', 'yes'] as const) {
      const pos = computeTotals([{ qty: 3, unitPrice, fullPayment: true }], 0, taxInvoice);
      const quickPayable = calculatePayableTotal(quick.grandTotal, taxInvoice);

      assert.equal(pos.grandTotal, quickPayable);
      assert.equal(Number.isInteger(Math.round(pos.grandTotal * 100)), true);
    }
  }
});

test('POS and Quick Sale keep percentage discount and VAT rounding in parity', () => {
  for (let satang = 1; satang <= 10_000; satang += 37) {
    const unitPrice = satang / 100;
    const quick = calculateQuickSale(unitPrice * 3, 12.5, 'percent');
    for (const taxInvoice of ['no', 'yes'] as const) {
      const pos = computeTotals(
        [{ qty: 3, unitPrice, fullPayment: true }],
        { type: 'percent', value: 12.5 },
        taxInvoice
      );
      const quickPayable = calculatePayableTotal(quick.grandTotal, taxInvoice);

      assert.equal(pos.discountAmount, quick.discount);
      assert.equal(pos.grandTotal, quickPayable);
    }
  }
});

test('POS and Quick Sale use the same basis-point rule for percentage input', () => {
  const quick = calculateQuickSale(333.33, 12.345, 'percent');
  const pos = computeTotals(
    [{ qty: 1, unitPrice: 333.33, fullPayment: true }],
    { type: 'percent', value: 12.345 },
    'yes'
  );

  assert.equal(quick.discount, 41.17);
  assert.equal(pos.discountAmount, quick.discount);
  assert.equal(pos.grandTotal, calculatePayableTotal(quick.grandTotal, 'yes'));
});

test('cash change never becomes negative', () => {
  assert.equal(calculateChange(500, 350), 150);
  assert.equal(calculateChange(100, 350), 0);
});

test('quick sale keeps receipt total unchanged and adds VAT for a tax invoice', () => {
  assert.equal(calculateAddedVat(120), 8.4);
  assert.equal(calculatePayableTotal(120, 'yes'), 128.4);
  assert.equal(calculatePayableTotal(120, 'no'), 120);
  assert.equal(calculatePayableTotal(240, 'no'), 240);
  assert.equal(calculatePayableTotal(240, 'yes'), 256.8);
});

test('manual transfer fallback requires staff verification when PromptPay profile is unavailable', () => {
  assert.equal(canConfirmQuickSalePayment({ paymentMethod: 'promptpay', hasEnoughCash: false, hasPaymentQrProfile: true, manualTransferVerified: false }), true);
  assert.equal(canConfirmQuickSalePayment({ paymentMethod: 'promptpay', hasEnoughCash: false, hasPaymentQrProfile: false, manualTransferVerified: false }), false);
  assert.equal(canConfirmQuickSalePayment({ paymentMethod: 'promptpay', hasEnoughCash: false, hasPaymentQrProfile: false, manualTransferVerified: true }), true);
  assert.equal(canConfirmQuickSalePayment({ paymentMethod: 'cash', hasEnoughCash: false, hasPaymentQrProfile: false, manualTransferVerified: true }), false);
  assert.equal(canConfirmQuickSalePayment({ paymentMethod: 'cash', hasEnoughCash: true, hasPaymentQrProfile: false, manualTransferVerified: false }), true);
});

test('quick sale enforces the 30-day Bangkok backdate window and required reason', () => {
  const now = new Date('2026-08-29T14:00:00.000Z');

  assert.deepEqual(
    validateQuickSaleBackdate({
      entryMode: 'backdated',
      saleDate: new Date('2026-07-30T16:30:00.000Z'),
      backdatedReason: 'รายการตกหล่น',
      now,
    }),
    { valid: true }
  );
  assert.equal(
    validateQuickSaleBackdate({
      entryMode: 'backdated',
      saleDate: new Date('2026-07-29T16:30:00.000Z'),
      backdatedReason: 'รายการตกหล่น',
      now,
    }).valid,
    false
  );
  assert.equal(
    validateQuickSaleBackdate({
      entryMode: 'backdated',
      saleDate: new Date('2026-08-20T10:00:00.000Z'),
      backdatedReason: '   ',
      now,
    }).message,
    'กรุณาระบุเหตุผลที่ลงรายการย้อนหลัง'
  );
});

test('quick sale backdate validation uses Bangkok calendar boundaries', () => {
  const now = new Date('2026-08-29T17:05:00.000Z');

  assert.equal(
    validateQuickSaleBackdate({
      entryMode: 'backdated',
      saleDate: new Date('2026-07-30T16:59:59.000Z'),
      backdatedReason: 'รายการตกหล่น',
      now,
    }).valid,
    false
  );
  assert.equal(
    validateQuickSaleBackdate({
      entryMode: 'backdated',
      saleDate: new Date('2026-07-31T00:00:00.000Z'),
      backdatedReason: 'รายการตกหล่น',
      now,
    }).valid,
    true
  );
});

test('default variants are recognized case-insensitively', () => {
  assert.equal(isDefaultVariantName('default'), true);
  assert.equal(isDefaultVariantName(' Default '), true);
  assert.equal(isDefaultVariantName('DEFAULT'), true);
  assert.equal(isDefaultVariantName('A4 สี'), false);
});
