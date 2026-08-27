import type { UploadPayload, UploadResponse } from '@/lib/upload-api';

export type UploadStatus = 'uploaded' | 'uploading' | 'waiting' | 'error';

export type UploadQueueItem<TFile extends File = File> = {
  id: string;
  file: TFile;
  status: UploadStatus;
  uploaded?: UploadResponse;
  errorMessage?: string;
};

function normalizeUploadErrorMessage(error: unknown): string {
  const fallbackMessage = 'อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
  const message = error instanceof Error ? error.message : '';

  if (!message) {
    return fallbackMessage;
  }

  if (message.includes('phone must be longer than or equal to 9 characters') || message.includes('phone must contain digits only')) {
    return 'ระบบยังต้องการข้อมูลเบอร์โทรสำหรับการรับงาน กรุณาลองส่งใหม่อีกครั้ง';
  }

  return message;
}

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
      item.errorMessage = normalizeUploadErrorMessage(error);
    }
  }

  return {
    items: nextItems,
    attemptedCount: pendingItems.length,
    successCount,
    failureCount: pendingItems.length - successCount,
  };
}

export function openUploadedSignedUrl({
  signedUrl,
  openWindow,
}: Readonly<{
  signedUrl: string;
  openWindow: (signedUrl: string) => Window | null;
}>): void {
  if (!signedUrl) {
    throw new Error('ไม่พบลิงก์สำหรับเปิดไฟล์ที่เพิ่งอัปโหลด');
  }

  const openedWindow = openWindow(signedUrl);
  if (!openedWindow) {
    throw new Error('ไม่สามารถเปิดไฟล์อัตโนมัติได้ กรุณาอนุญาต popup แล้วลองอีกครั้ง');
  }
}
