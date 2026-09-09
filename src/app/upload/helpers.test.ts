import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_FILE_SIZE_BYTES, MAX_UPLOAD_BATCH_SIZE_BYTES, validateUploadFile } from './helpers';

function createFile(size: number): File {
  const file = new File(['%PDF-1.7'], 'artwork.pdf', { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

test('upload limits are 20 MB per file and 200 MB per batch', () => {
  assert.equal(MAX_FILE_SIZE_BYTES, 20_000_000);
  assert.equal(MAX_UPLOAD_BATCH_SIZE_BYTES, 200_000_000);
});

test('validateUploadFile accepts the exact 20 MB boundary and rejects larger files', () => {
  assert.deepEqual(validateUploadFile(createFile(MAX_FILE_SIZE_BYTES)), { valid: true });
  assert.deepEqual(validateUploadFile(createFile(MAX_FILE_SIZE_BYTES + 1)), {
    valid: false,
    reason: 'size',
  });
});
