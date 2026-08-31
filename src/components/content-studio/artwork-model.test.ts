import assert from 'node:assert/strict';
import test from 'node:test';
import { printFileArtworkSample, truncateThaiText } from './artwork-model';

test('truncateThaiText preserves short Thai text and clamps long content', () => {
  assert.equal(truncateThaiText('ไฟล์ดี งานพิมพ์สวย', 40), 'ไฟล์ดี งานพิมพ์สวย');
  const result = truncateThaiText('ไฟล์ต้นฉบับความละเอียดสูงสำหรับงานพิมพ์คุณภาพ', 12);
  assert.ok(result.endsWith('…'));
  assert.ok(Array.from(result).length < 30);
});

test('premium editorial sample stays on the fixed social composition contract', () => {
  assert.equal(printFileArtworkSample.width, 1080);
  assert.equal(printFileArtworkSample.height, 1350);
  assert.equal(printFileArtworkSample.columns.length, 2);
  assert.deepEqual(printFileArtworkSample.columns.map(column => column.cards.length), [3, 3]);
  assert.equal(printFileArtworkSample.visual.provider, 'local-placeholder');
});
