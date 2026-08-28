import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_PROXY_BODY_LIMIT_BYTES,
  PUBLIC_UPLOAD_PROXY_BODY_LIMIT_BYTES,
  ProxyBodyTooLargeError,
  contentLengthExceedsLimit,
  createBoundedBodyStream,
  getProxyBodyLimit,
} from './proxyPolicy';

test('public upload proxy keeps the backend aggregate limit while normal commands use a smaller ingress bound', () => {
  assert.equal(getProxyBodyLimit(['uploads']), PUBLIC_UPLOAD_PROXY_BODY_LIMIT_BYTES);
  assert.equal(getProxyBodyLimit(['upload']), PUBLIC_UPLOAD_PROXY_BODY_LIMIT_BYTES);
  assert.equal(getProxyBodyLimit(['orders']), DEFAULT_PROXY_BODY_LIMIT_BYTES);
  assert.equal(getProxyBodyLimit(['tracking', 'lookup']), DEFAULT_PROXY_BODY_LIMIT_BYTES);
});

test('content-length can reject an oversized request before the body is consumed', () => {
  assert.equal(contentLengthExceedsLimit(new Headers({ 'content-length': '25000001' }), 25_000_000), true);
  assert.equal(contentLengthExceedsLimit(new Headers({ 'content-length': '25000000' }), 25_000_000), false);
  assert.equal(contentLengthExceedsLimit(new Headers(), 25_000_000), false);
});

test('bounded streaming forwards chunks without materializing the whole body and fails once the limit is crossed', async () => {
  let exceeded = false;
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]));
      controller.enqueue(new Uint8Array([4, 5, 6]));
      controller.close();
    },
  });
  const reader = createBoundedBodyStream(source, 5, () => {
    exceeded = true;
  }).getReader();

  const first = await reader.read();
  assert.deepEqual(Array.from(first.value ?? []), [1, 2, 3]);
  await assert.rejects(reader.read(), ProxyBodyTooLargeError);
  assert.equal(exceeded, true);
});
