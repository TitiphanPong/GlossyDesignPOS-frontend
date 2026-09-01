import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_QUICK_SALE_V2_DOCUMENT_DEFAULTS,
  documentMappingKey,
  normalizeDocumentDefaults,
  resolveDocumentMapping,
  type QuickSaleV2DocumentMapping,
} from './quickSaleV2';

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

test('Quick Sale V2 document defaults preserve valid published selections and quantity', () => {
  assert.deepEqual(normalizeDocumentDefaults({ workType: 'copy', size: 'A3', colorMode: 'color', quantity: 20 }), {
    workType: 'copy',
    size: 'A3',
    colorMode: 'color',
    quantity: 20,
  });
});

test('Quick Sale V2 document defaults fall back safely for legacy or malformed config', () => {
  assert.deepEqual(normalizeDocumentDefaults({ workType: 'other', size: 'A5', colorMode: 'spot', quantity: 0 }), DEFAULT_QUICK_SALE_V2_DOCUMENT_DEFAULTS);
});
