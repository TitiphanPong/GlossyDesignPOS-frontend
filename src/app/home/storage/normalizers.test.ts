import assert from 'node:assert/strict';
import test from 'node:test';

import { groupStorageRows, inferStatus, normalizeFiles, normalizeRecord } from './normalizers';

test('inferStatus maps backend status variants into storage statuses', () => {
  assert.equal(inferStatus('completed'), 'completed');
  assert.equal(inferStatus('Done'), 'completed');
  assert.equal(inferStatus('processing now'), 'pending');
  assert.equal(inferStatus('working'), 'pending');
  assert.equal(inferStatus('unknown'), 'waiting');
  assert.equal(inferStatus(undefined), 'waiting');
});

test('normalizeFiles supports string file arrays and object file metadata variants', () => {
  const files = normalizeFiles([
    'uploads/customer/job-a.pdf',
    {
      fileId: 'file-2',
      originalName: 'proof.png',
      signedUrl: 'https://cdn.example.com/proof.png',
      bytes: 524288,
      thumb: 'https://cdn.example.com/proof-thumb.png',
    },
    {
      key: 'file-3',
      filename: 'document.ai',
      url: 'https://cdn.example.com/document.ai',
      size: 2097152,
    },
  ]);

  assert.equal(files.length, 3);
  assert.deepEqual(files[0], {
    id: 'uploads/customer/job-a.pdf',
    name: 'job-a.pdf',
    url: '',
    size: '4.9 MB',
  });
  assert.deepEqual(files[1], {
    id: 'file-2',
    name: 'proof.png',
    url: 'https://cdn.example.com/proof.png',
    thumbnail: 'https://cdn.example.com/proof-thumb.png',
    size: '512 KB',
  });
  assert.equal(files[2]?.id, 'file-3');
  assert.equal(files[2]?.name, 'document.ai');
  assert.equal(files[2]?.url, 'https://cdn.example.com/document.ai');
  assert.equal(files[2]?.size, '2.0 MB');
});

test('normalizeRecord fills alternate id and customer fields safely', () => {
  const record = normalizeRecord({
    id: 'upload-123',
    customer: 'สมชาย',
    phoneNumber: '0812345678',
    line: '@somchai',
    category: 'นามบัตร',
    note: 'ด่วน',
    files: ['uploads/customer/card.pdf'],
    createdAt: '2026-05-20T10:00:00.000Z',
    status: 'success',
  });

  assert.equal(record.id, 'upload-123');
  assert.deepEqual(record.sourceIds, ['upload-123']);
  assert.equal(record.customerName, 'สมชาย');
  assert.equal(record.phone, '0812345678');
  assert.equal(record.lineId, '@somchai');
  assert.equal(record.jobType, 'นามบัตร');
  assert.equal(record.notes, 'ด่วน');
  assert.equal(record.status, 'completed');
  assert.equal(record.uploadDate, '2026-05-20T10:00:00.000Z');
  assert.equal(record.files.length, 1);
  assert.equal(record.files[0]?.name, 'card.pdf');
  assert.equal(record.activities.length, 3);
});

test('normalizeRecord maps stage markers into waiting and pending states', () => {
  const waitingRecord = normalizeRecord({
    id: 'upload-1',
    note: 'พิมพ์หน้าเดียว\n\n[[stage:waiting-download]]',
    status: 'pending',
    files: [],
  });
  const pendingRecord = normalizeRecord({
    id: 'upload-2',
    note: 'พิมพ์สองหน้า\n\n[[stage:pending]]',
    status: 'pending',
    files: [],
  });

  assert.equal(waitingRecord.status, 'waiting');
  assert.equal(pendingRecord.status, 'pending');
});

test('normalizeRecord strips hidden batch markers from notes', () => {
  const record = normalizeRecord({
    id: 'upload-123',
    note: 'เป็นสี 2 ด้าน\n\n[[batch:batch-abc-123]]\n[[stage:pending]]',
    files: [],
  });

  assert.equal(record.batchId, 'batch-abc-123');
  assert.equal(record.notes, 'เป็นสี 2 ด้าน');
});

test('normalizeRecord prefers structured metadata fields over legacy note markers', () => {
  const record = normalizeRecord({
    id: 'upload-structured',
    note: 'legacy note\n\n[[batch:legacy-batch]]\n[[stage:waiting-download]]',
    statusNote: 'structured note',
    batchId: 'batch-structured',
    stage: 'pending',
    files: [],
  });

  assert.equal(record.batchId, 'batch-structured');
  assert.equal(record.status, 'pending');
  assert.equal(record.notes, 'structured note');
});

test('groupStorageRows merges files from the same batch into one row', () => {
  const rows = [
    normalizeRecord({
      id: 'upload-1',
      createdAt: '2026-05-20T10:00:00.000Z',
      customerName: 'Walk-in Customer',
      phone: '000000000',
      jobType: 'Other',
      note: 'เป็นสี 2 ด้าน\n\n[[batch:batch-xyz]]\n[[stage:waiting-download]]',
      files: [{ fileId: 'file-1', originalName: 'a.pdf', size: 1000 }],
    }),
    normalizeRecord({
      id: 'upload-2',
      createdAt: '2026-05-20T10:00:01.000Z',
      customerName: 'Walk-in Customer',
      phone: '000000000',
      jobType: 'Other',
      note: 'เป็นสี 2 ด้าน\n\n[[batch:batch-xyz]]\n[[stage:waiting-download]]',
      files: [{ fileId: 'file-2', originalName: 'b.pdf', size: 2000 }],
    }),
  ];

  const grouped = groupStorageRows(rows);

  assert.equal(grouped.length, 1);
  assert.equal(grouped[0]?.id, 'upload-1');
  assert.deepEqual(grouped[0]?.sourceIds, ['upload-1', 'upload-2']);
  assert.equal(grouped[0]?.notes, 'เป็นสี 2 ด้าน');
  assert.equal(grouped[0]?.files.length, 2);
});

test('normalizeRecord falls back safely when backend fields are missing', () => {
  const record = normalizeRecord({
    uploadId: 'upload-456',
    files: [],
  });

  assert.equal(record.id, 'upload-456');
  assert.equal(record.customerName, 'ไม่ระบุชื่อลูกค้า');
  assert.equal(record.phone, '-');
  assert.equal(record.lineId, '-');
  assert.equal(record.jobType, 'งานพิมพ์ทั่วไป');
  assert.equal(record.notes, '-');
  assert.equal(record.status, 'waiting');
  assert.deepEqual(record.files, []);
});
