import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import sharp from 'sharp';
import { createBridgeServer, isValidToken, pngToEscPos, rasterToEscPos } from './thermal-print-bridge.mjs';

const TOKEN = 'a'.repeat(64);
const ORIGIN = 'https://glossy-design.vercel.app';
const printId = '11111111-2222-4333-8444-555555555555';

test('pairing token must match exactly', () => {
  assert.equal(isValidToken(TOKEN, TOKEN), true);
  assert.equal(isValidToken('b'.repeat(64), TOKEN), false);
  assert.equal(isValidToken('x', TOKEN), false);
});

test('ESC/POS raster initializes, sends 72mm width and cuts', () => {
  const payload = rasterToEscPos(Buffer.alloc(576 * 2, 0), 576, 2);
  assert.deepEqual([...payload.subarray(0, 10)], [27, 64, 29, 118, 48, 0, 72, 0, 2, 0]);
  assert.deepEqual([...payload.subarray(-5)], [10, 10, 29, 86, 0]);
  assert.throws(() => rasterToEscPos(Buffer.alloc(100), 400, 2), /invalid-raster-size/);
});

test('converts ordinary PNG to ESC/POS without a driver', async () => {
  const png = await sharp({ create: { width: 200, height: 150, channels: 3, background: '#333333' } }).png().toBuffer();
  const output = await pngToEscPos(png);
  assert.ok(output.length > 2000);
  await assert.rejects(pngToEscPos(Buffer.from('not png')), /invalid-png/);
});

test('bridge requires trusted origin and bearer; valid job prints once', async () => {
  let count = 0;
  const server = createBridgeServer({ token: TOKEN, printFn: async data => { count++; assert.ok(data.length > 1000); } });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port;
  try {
    const image = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#111111' } }).png().toBuffer();
    const make = (headers = {}, method = 'POST', body = image) => fetch(url + '/v1/print', {
      method, headers: { Origin: ORIGIN, Authorization: 'Bearer ' + TOKEN,
        'Content-Type': 'image/png', 'X-Glossy-Print-Id': printId, ...headers },
      ...(method === 'POST' ? { body } : {}),
    });
    assert.equal((await make({ Origin: 'https://attacker.example' })).status, 403);
    assert.equal((await make({ Authorization: 'Bearer ' + 'b'.repeat(64) })).status, 401);
    assert.equal((await make({ 'Content-Type': 'text/plain' })).status, 415);
    assert.equal((await make({}, 'POST', Buffer.from('broken'))).status, 422);
    const options = await fetch(url + '/v1/print', { method: 'OPTIONS',
      headers: { Origin: ORIGIN, 'Access-Control-Request-Private-Network': 'true' } });
    assert.equal(options.status, 204);
    assert.equal(options.headers.get('Access-Control-Allow-Private-Network'), 'true');
    assert.equal((await make()).status, 200);
    assert.equal((await make()).status, 200);
    assert.equal(count, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
