import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPaymentQrPayload,
  isValidMerchantStaticQrPayload,
  normalizeMerchantStaticQrProfile,
  normalizePromptPayAmount,
  normalizePromptPayProfile,
  paymentQrRequiresManualAmount,
} from './promptpay';

const merchantStaticPayload = '00020101021130710016A00000067701011201150999999999999990220123456789012345678900304TEST53037645802TH63040F16';

test('normalizePromptPayProfile returns one normalized customer-facing identity', () => {
  assert.deepEqual(
    normalizePromptPayProfile({ target: ' 0812345678 ', displayName: ' Glossy Design ' }),
    {
      target: '0812345678',
      displayName: 'Glossy Design',
      displayIdentifier: 'PromptPay ••••5678',
    },
  );
});

test('normalizePromptPayProfile fails closed when target or display name is missing', () => {
  assert.equal(normalizePromptPayProfile({ target: '', displayName: 'Glossy Design' }), null);
  assert.equal(normalizePromptPayProfile({ target: '0812345678', displayName: '  ' }), null);
  assert.equal(normalizePromptPayProfile({}), null);
});

test('merchant static QR accepts the decoded bank-issued payload and verifies CRC', () => {
  assert.equal(isValidMerchantStaticQrPayload(merchantStaticPayload), true);
  assert.equal(isValidMerchantStaticQrPayload(`${merchantStaticPayload.slice(0, -4)}0000`), false);

  const profile = normalizeMerchantStaticQrProfile({
    payload: merchantStaticPayload,
    displayName: ' กรอสซี่ ดีไซน์ ',
    displayIdentifier: ' QR ร้านค้า · ออมสิน ',
  });

  assert.deepEqual(profile, {
    kind: 'merchant-static',
    payload: merchantStaticPayload,
    displayName: 'กรอสซี่ ดีไซน์',
    displayIdentifier: 'QR ร้านค้า · ออมสิน',
  });
});

test('merchant static QR fails closed for missing identity or invalid payload', () => {
  assert.equal(normalizeMerchantStaticQrProfile({ payload: merchantStaticPayload, displayName: '' }), null);
  assert.equal(normalizeMerchantStaticQrProfile({ payload: '0002016304FFFF', displayName: 'Glossy Design' }), null);
});

test('payment QR builder preserves static merchant payload and marks manual amount entry', () => {
  const profile = normalizeMerchantStaticQrProfile({ payload: merchantStaticPayload, displayName: 'Glossy Design' });
  assert.ok(profile);
  assert.equal(buildPaymentQrPayload(profile, 16.05), merchantStaticPayload);
  assert.equal(paymentQrRequiresManualAmount(profile), true);
});

test('payment QR builder keeps dynamic PromptPay behavior for legacy profile', () => {
  const promptpay = normalizePromptPayProfile({ target: '0812345678', displayName: 'Glossy Design' });
  assert.ok(promptpay);
  const profile = { kind: 'promptpay' as const, ...promptpay };
  const qrPayload = buildPaymentQrPayload(profile, 16.05);
  assert.match(qrPayload, /^000201/u);
  assert.equal(paymentQrRequiresManualAmount(profile), false);
});

test('normalizePromptPayAmount preserves satang precision', () => {
  assert.equal(normalizePromptPayAmount(0.01), 0.01);
  assert.equal(normalizePromptPayAmount(128.4), 128.4);
  assert.equal(normalizePromptPayAmount(128.6), 128.6);
});

test('normalizePromptPayAmount rounds to two decimal places', () => {
  assert.equal(normalizePromptPayAmount(10.005), 10.01);
  assert.equal(normalizePromptPayAmount(10.004), 10);
});

test('normalizePromptPayAmount rejects invalid amounts', () => {
  assert.throws(() => normalizePromptPayAmount(Number.NaN));
  assert.throws(() => normalizePromptPayAmount(Number.POSITIVE_INFINITY));
  assert.throws(() => normalizePromptPayAmount(-0.01));
});
