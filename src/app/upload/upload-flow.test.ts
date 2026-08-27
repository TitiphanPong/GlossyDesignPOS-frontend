import assert from 'node:assert/strict';
import test from 'node:test';

import { createUploadQueueItems, openUploadedSignedUrl, uploadPendingFiles, type UploadQueueItem } from './upload-flow';

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
    {
      id: 'c',
      file: createFile('c.pdf', 140),
      status: 'uploaded',
      uploaded: {
        id: 'existing',
        originalName: 'c.pdf',
        size: 140,
        mimeType: 'application/pdf',
        createdAt: '2026-05-24T00:00:00.000Z',
        signedUrl: 'https://cdn.example.com/existing',
        expiresIn: 900,
      },
    },
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
        signedUrl: `https://cdn.example.com/${file.name}`,
        expiresIn: 900,
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

test('openUploadedSignedUrl opens the immediate public upload preview without another API request', () => {
  const openedUrls: string[] = [];

  openUploadedSignedUrl({
    signedUrl: 'https://cdn.example.com/immediate-preview',
    openWindow: signedUrl => {
      openedUrls.push(signedUrl);
      return {} as Window;
    },
  });

  assert.deepEqual(openedUrls, ['https://cdn.example.com/immediate-preview']);
});

test('openUploadedSignedUrl reports popup blocking', () => {
  assert.throws(
    () =>
      openUploadedSignedUrl({
        signedUrl: 'https://cdn.example.com/immediate-preview',
        openWindow: () => null,
      }),
    /popup/,
  );
});
