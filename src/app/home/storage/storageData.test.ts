import assert from 'node:assert/strict';
import test from 'node:test';
import type { StorageRow } from './normalizers';
import {
  applyStorageRowPatch,
  buildPersistedNote,
  compareStorageRows,
  getBulkMutationTargetIds,
  matchesStorageDateFilter,
  matchesStorageSearch,
  toPersistedUploadStatus,
  toStructuredStage,
} from './storageData';

function row(overrides: Partial<StorageRow> = {}): StorageRow {
  return {
    id: 'row-1',
    sourceIds: ['source-1'],
    uploadDate: '2026-08-12T08:00:00.000Z',
    customerName: 'Glossy Customer',
    phone: '0812345678',
    lineId: 'glossy',
    jobType: 'Document',
    files: [],
    status: 'waiting',
    notes: 'งานด่วน',
    activities: [],
    ...overrides,
  };
}

test('storage selectors filter search and dates without mutating rows', () => {
  const source = row();
  assert.equal(matchesStorageSearch(source, 'glossy'), true);
  assert.equal(matchesStorageSearch(source, '0812'), true);
  assert.equal(matchesStorageSearch(source, 'missing'), false);
  assert.equal(matchesStorageDateFilter(source.uploadDate, '2026-08-12'), true);
  assert.equal(matchesStorageDateFilter('invalid', '2026-08-12'), false);
});

test('storage sorting supports newest, oldest, customer, and status', () => {
  const first = row({ customerName: 'Beta', uploadDate: '2026-08-11T00:00:00.000Z', status: 'waiting' });
  const second = row({ id: 'row-2', customerName: 'Alpha', uploadDate: '2026-08-12T00:00:00.000Z', status: 'completed' });
  assert.ok(compareStorageRows(first, second, 'newest') > 0);
  assert.ok(compareStorageRows(first, second, 'oldest') < 0);
  assert.ok(compareStorageRows(first, second, 'customer') > 0);
  assert.ok(compareStorageRows(first, second, 'status') > 0);
});

test('storage mutations expand grouped ids and patch only supplied values', () => {
  const grouped = row({ sourceIds: ['source-1', 'source-2'] });
  const ids = getBulkMutationTargetIds(['row-1', 'missing'], new Map([['row-1', grouped]]));
  assert.deepEqual(ids, ['source-1', 'source-2', 'missing']);
  assert.deepEqual(applyStorageRowPatch(grouped, { status: 'completed' }), { ...grouped, status: 'completed' });
});

test('storage persistence uses structured stage fields and clean customer notes', () => {
  assert.equal(buildPersistedNote('  ข้อความลูกค้า  '), 'ข้อความลูกค้า');
  assert.equal(buildPersistedNote('note [[stage:pending]]'), 'note [[stage:pending]]');
  assert.equal(toPersistedUploadStatus('waiting'), 'pending');
  assert.equal(toPersistedUploadStatus('completed'), 'completed');
  assert.equal(toStructuredStage('waiting'), 'waiting-download');
  assert.equal(toStructuredStage('pending'), 'pending');
});
