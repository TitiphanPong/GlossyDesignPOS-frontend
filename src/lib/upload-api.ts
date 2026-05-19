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

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_URL. Please set it in your environment variables.');
  }
  return apiBaseUrl;
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }
  } catch {
    // no-op: fallback to text below
  }

  const text = await res.text().catch(() => '');
  if (text.trim()) return text;
  return `Request failed with status ${res.status}`;
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

  const res = await fetch(`${getApiBaseUrl()}/uploads`, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return (await res.json()) as UploadResponse;
}

export async function getSignedUrl(id: string, signal?: AbortSignal): Promise<SignedUrlResponse> {
  const res = await fetch(`${getApiBaseUrl()}/uploads/${encodeURIComponent(id)}/signed-url`, {
    method: 'GET',
    signal,
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return (await res.json()) as SignedUrlResponse;
}
