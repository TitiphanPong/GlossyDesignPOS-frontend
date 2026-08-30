'use client';

import liff from '@line/liff';
import { buildApiUrl, parseApiErrorResponse } from './api';

export type LineUploadSession = {
  idToken: string;
  displayName: string;
  pictureUrl: string | null;
  isInClient: boolean;
};

export type LineUploadSessionResult =
  | { status: 'ready'; session: LineUploadSession }
  | { status: 'redirecting' };

type VerifiedLineSessionResponse = {
  verified: true;
  displayName: string;
  pictureUrl: string | null;
};

let liffInitialization: Promise<void> | null = null;

async function ensureLiffInitialized(liffId: string): Promise<void> {
  liffInitialization ??= liff.init({
    liffId,
    withLoginOnExternalBrowser: true,
  });
  await liffInitialization;
}

async function verifySessionWithBackend(
  idToken: string,
): Promise<VerifiedLineSessionResponse> {
  const response = await fetch(buildApiUrl('/line/session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorResponse(response));
  }

  const payload = (await response.json()) as Partial<VerifiedLineSessionResponse>;
  if (
    payload.verified !== true ||
    typeof payload.displayName !== 'string' ||
    !payload.displayName.trim()
  ) {
    throw new Error('LINE identity response is invalid');
  }

  return {
    verified: true,
    displayName: payload.displayName.trim(),
    pictureUrl:
      typeof payload.pictureUrl === 'string' && payload.pictureUrl.trim()
        ? payload.pictureUrl.trim()
        : null,
  };
}

export async function initializeLineUploadSession(): Promise<LineUploadSessionResult> {
  const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID?.trim();
  if (!liffId) {
    throw new Error('ยังไม่ได้ตั้งค่า LIFF ID สำหรับหน้าอัปโหลดผ่าน LINE');
  }

  await ensureLiffInitialized(liffId);

  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
    return { status: 'redirecting' };
  }

  const idToken = liff.getIDToken();
  if (!idToken) {
    throw new Error('ไม่สามารถรับข้อมูลยืนยันตัวตนจาก LINE ได้');
  }

  const verified = await verifySessionWithBackend(idToken);
  return {
    status: 'ready',
    session: {
      idToken,
      displayName: verified.displayName,
      pictureUrl: verified.pictureUrl,
      isInClient: liff.isInClient(),
    },
  };
}

export function closeLineLiffWindow(): void {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}
