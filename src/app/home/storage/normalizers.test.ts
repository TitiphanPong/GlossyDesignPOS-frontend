import assert from 'node:assert/strict';
import test from 'node:test';

import { inferStatus, normalizeFiles, normalizeRecord } from './normalizers';

test('inferStatus maps backend status variants into storage statuses', () => {
  assert.equal(inferStatus('completed'), 'completed');
  assert.equal(inferStatus('Done'), 'completed');
  assert.equal(inferStatus('processing now'), 'processing');
  assert.equal(inferStatus('working'), 'processing');
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
