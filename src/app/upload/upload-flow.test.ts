import assert from 'node:assert/strict';
import test from 'node:test';

import { createUploadQueueItems, openSignedUrlWithRetry, uploadPendingFiles, type UploadQueueItem } from './upload-flow.ts';

function createFile(name: string, size: number, type = 'application/pdf'): File {
  return new File(['x'.repeat(Math.min(size, 8))], name, { type, lastModified: 1 });
}

test('createUploadQueueItems validates files, skips duplicates, and advances to upload step when valid files exist', () => {
  const validFile = createFile('poster.pdf', 1024);
  const invalidFile = createFile('script.exe', 2048, 'application/octet-stream');
  const duplicateFile = createFile('poster.pdf', 1024);

  const result = createUploadQueueItems({
    incomingFiles: [validFile, invalidFile, duplicateFile],
    existingIds: new Set<string>(),
    buildFileId: file => `${file.name}-${file.size}-${file.lastModified}`,
    getValidationError: file => (file.name.endsWith('.exe') ? `ไฟล์ ${file.name} ไม่รองรับนามสกุลนี้` : null),
  });

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0]?.status, 'waiting');
  assert.equal(result.items[0]?.file.name, 'poster.pdf');
  assert.deepEqual(result.validationMessages, ['ไฟล์ script.exe ไม่รองรับนามสกุลนี้']);
  assert.equal(result.shouldMoveToUploadStep, true);
});

test('uploadPendingFiles uploads waiting and error items, preserving partial failures for retry', async () => {
  const files = [
    { id: 'a', file: createFile('a.pdf', 100), status: 'waiting' },
    { id: 'b', file: createFile('b.pdf', 120), status: 'error', errorMessage: 'old error' },
    { id: 'c', file: createFile('c.pdf', 140), status: 'uploaded', uploaded: { id: 'existing', originalName: 'c.pdf', size: 140, mimeType: 'application/pdf', createdAt: '2026-05-24T00:00:00.000Z' } },
  ] satisfies UploadQueueItem[];

  const uploadCalls: string[] = [];
  const result = await uploadPendingFiles({
    items: files,
    payload: {
      customerName: 'Customer',
      phone: '0812345678',
      jobType: 'Document Printing',
      note: 'Rush',
    },
    upload: async file => {
      uploadCalls.push(file.name);
      if (file.name === 'b.pdf') {
        throw new Error('network fail');
      }

      return {
        id: `upload-${file.name}`,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        createdAt: '2026-05-24T00:00:00.000Z',
      };
    },
  });

  assert.deepEqual(uploadCalls, ['a.pdf', 'b.pdf']);
  assert.equal(result.attemptedCount, 2);
  assert.equal(result.successCount, 1);
  assert.equal(result.failureCount, 1);
  assert.equal(result.items[0]?.status, 'uploaded');
  assert.equal(result.items[0]?.uploaded?.id, 'upload-a.pdf');
  assert.equal(result.items[1]?.status, 'error');
  assert.equal(result.items[1]?.errorMessage, 'network fail');
  assert.equal(result.items[2]?.uploaded?.id, 'existing');
});

test('openSignedUrlWithRetry retries popup opening once before succeeding', async () => {
  const openedUrls: string[] = [];
  let openAttempts = 0;
  let signedUrlCalls = 0;

  await openSignedUrlWithRetry({
    id: 'upload-123',
    getSignedUrl: async id => {
      signedUrlCalls += 1;
      return { signedUrl: `https://cdn.example.com/${id}?attempt=${signedUrlCalls}` };
    },
    openWindow: signedUrl => {
      openedUrls.push(signedUrl);
      openAttempts += 1;
      return openAttempts === 1 ? null : ({} as Window);
    },
  });

  assert.equal(signedUrlCalls, 2);
  assert.deepEqual(openedUrls, ['https://cdn.example.com/upload-123?attempt=1', 'https://cdn.example.com/upload-123?attempt=2']);
});

test('openSignedUrlWithRetry throws after exhausting popup retries', async () => {
  await assert.rejects(
    () =>
      openSignedUrlWithRetry({
        id: 'upload-456',
        getSignedUrl: async id => ({ signedUrl: `https://cdn.example.com/${id}` }),
        openWindow: () => null,
      }),
    /Unable to open file automatically/,
  );
});
