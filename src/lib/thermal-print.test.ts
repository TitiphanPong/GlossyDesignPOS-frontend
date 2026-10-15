import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPairingToken, printThermalReceipt, THERMAL_BRIDGE_URL } from './thermal-print';

const token = 'a'.repeat(64);
const png = new Blob([Buffer.alloc(20)], { type: 'image/png' });

test('pairing code must be exactly 64 lowercase hex characters', () => {
  assert.equal(isValidPairingToken(token), true);
  assert.equal(isValidPairingToken('not-a-token'), false);
  assert.equal(isValidPairingToken('A'.repeat(64)), false);
});

test('sends PNG only to local print bridge with per-click ID', async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = (async (input, init) => {
    requests++;
    assert.equal(input, THERMAL_BRIDGE_URL + '/v1/print');
    assert.equal(init?.method, 'POST');
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer ' + token);
    assert.equal((init?.headers as Record<string, string>)['Content-Type'], 'image/png');
    assert.match((init?.headers as Record<string, string>)['X-Glossy-Print-Id'], /^[0-9a-f-]{36}$/);
    assert.equal(init?.body, png);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;
  try {
    await printThermalReceipt(png, token);
    assert.equal(requests, 1);
  } finally { globalThis.fetch = original; }
});

test('does not send without token or valid PNG', async () => {
  await assert.rejects(printThermalReceipt(png, ''), /รหัสจับคู่/);
  await assert.rejects(printThermalReceipt(new Blob(['bad'], { type: 'text/plain' }), token), /ภาพใบเสร็จ/);
});

test('reports pairing errors from a live bridge', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ error: 'invalid-token' }), { status: 401 })) as typeof fetch;
  try { await assert.rejects(printThermalReceipt(png, token), /รหัสจับคู่/); }
  finally { globalThis.fetch = original; }
});
