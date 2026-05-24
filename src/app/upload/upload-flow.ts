import type { UploadPayload, UploadResponse, SignedUrlResponse } from '@/lib/upload-api';

export type UploadStatus = 'uploaded' | 'uploading' | 'waiting' | 'error';

export type UploadQueueItem<TFile extends File = File> = {
  id: string;
  file: TFile;
  status: UploadStatus;
  uploaded?: UploadResponse;
  errorMessage?: string;
};

export function createUploadQueueItems<TFile extends File>({
  incomingFiles,
  existingIds,
  buildFileId,
  getValidationError,
}: Readonly<{
  incomingFiles: readonly TFile[];
  existingIds: ReadonlySet<string>;
  buildFileId: (file: TFile) => string;
  getValidationError: (file: TFile) => string | null;
}>): {
  items: UploadQueueItem<TFile>[];
  validationMessages: string[];
  shouldMoveToUploadStep: boolean;
} {
  const nextItems: UploadQueueItem<TFile>[] = [];
  const validationMessages: string[] = [];
  const seenIds = new Set(existingIds);

  for (const file of incomingFiles) {
    const error = getValidationError(file);
    if (error) {
      validationMessages.push(error);
      continue;
    }

    const id = buildFileId(file);
    if (seenIds.has(id)) {
      continue;
    }

    seenIds.add(id);
    nextItems.push({
      id,
      file,
      status: 'waiting',
    });
  }

  return {
    items: nextItems,
    validationMessages,
    shouldMoveToUploadStep: nextItems.length > 0,
  };
}

export async function uploadPendingFiles<TFile extends File>({
  items,
  payload,
  upload,
}: Readonly<{
  items: readonly UploadQueueItem<TFile>[];
  payload: UploadPayload;
  upload: (file: TFile, payload: UploadPayload) => Promise<UploadResponse>;
}>): Promise<{
  items: UploadQueueItem<TFile>[];
  attemptedCount: number;
  successCount: number;
  failureCount: number;
}> {
  const nextItems = items.map(item => ({ ...item }));
  const pendingItems = nextItems.filter(item => item.status === 'waiting' || item.status === 'error');

  let successCount = 0;

  for (const item of pendingItems) {
    item.status = 'uploading';
    item.errorMessage = undefined;

    try {
      const uploaded = await upload(item.file, payload);
      item.status = 'uploaded';
      item.uploaded = uploaded;
      item.errorMessage = undefined;
      successCount += 1;
    } catch (error) {
      item.status = 'error';
      item.errorMessage = error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ';
    }
  }

  return {
    items: nextItems,
    attemptedCount: pendingItems.length,
    successCount,
    failureCount: pendingItems.length - successCount,
  };
}

export async function openSignedUrlWithRetry({
  id,
  getSignedUrl,
  openWindow,
  maxAttempts = 2,
}: Readonly<{
  id: string;
  getSignedUrl: (id: string) => Promise<SignedUrlResponse>;
  openWindow: (signedUrl: string) => Window | null;
  maxAttempts?: number;
}>): Promise<void> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const signed = await getSignedUrl(id);
    const openedWindow = openWindow(signed.signedUrl);
    if (openedWindow) {
      return;
    }

    attempts += 1;
  }

  throw new Error('Unable to open file automatically. Please allow popups and try again.');
}
