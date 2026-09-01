import test from 'node:test';
import assert from 'node:assert/strict';
import { documentMappingKey, resolveDocumentMapping, type QuickSaleV2DocumentMapping } from './quickSaleV2';

const mappings: QuickSaleV2DocumentMapping[] = [
  { workType: 'print', size: 'A4', colorMode: 'bw', quickProductId: 'quick-print-a4-bw' },
  { workType: 'copy', size: 'A3', colorMode: 'color', quickProductId: 'quick-copy-a3-color' },
];

test('Quick Sale V2 mapping key is deterministic across option dimensions', () => {
  assert.equal(documentMappingKey({ workType: 'print', size: 'A4', colorMode: 'bw' }), 'print:A4:bw');
  assert.equal(documentMappingKey({ workType: 'copy', size: 'A3', colorMode: 'color' }), 'copy:A3:color');
});

test('Quick Sale V2 resolves only an explicit stored mapping and never guesses another SKU', () => {
  assert.equal(resolveDocumentMapping(mappings, { workType: 'print', size: 'A4', colorMode: 'bw' })?.quickProductId, 'quick-print-a4-bw');
  assert.equal(resolveDocumentMapping(mappings, { workType: 'print', size: 'A4', colorMode: 'color' }), null);
  assert.equal(resolveDocumentMapping(mappings, { workType: 'scan', size: 'A3', colorMode: 'bw' }), null);
});
