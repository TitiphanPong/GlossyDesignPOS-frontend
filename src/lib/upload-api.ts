import { fetchApiJson } from './api';

export interface UploadResponse {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresIn?: number;
}

export interface UploadPayload {
  customerName: string;
  phone: string;
  jobType: string;
  note?: string;
}

export async function uploadFile(file: File, payload: UploadPayload, signal?: AbortSignal): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('customerName', payload.customerName);
  formData.append('phone', payload.phone);
  formData.append('jobType', payload.jobType);

  if (payload.note) {
    formData.append('note', payload.note);
  }

  return fetchApiJson<UploadResponse>('/uploads', {
    method: 'POST',
    body: formData,
    signal,
  });
}

export async function getSignedUrl(id: string, signal?: AbortSignal): Promise<SignedUrlResponse> {
  return fetchApiJson<SignedUrlResponse>(`/uploads/${encodeURIComponent(id)}/signed-url`, {
    method: 'GET',
    signal,
  });
}
