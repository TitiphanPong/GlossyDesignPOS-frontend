export const MISSING_API_BASE_ERROR = 'missing_api_base';

function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function hasApiBaseUrl(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
}

export function isMissingApiBaseError(error: unknown): boolean {
  return error instanceof Error && error.message === MISSING_API_BASE_ERROR;
}

export function getApiBaseUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase?.trim()) {
    throw new Error(MISSING_API_BASE_ERROR);
  }
  return normalizeApiBaseUrl(apiBase);
}

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

function readMessageFromBody(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (Array.isArray(body)) {
    const messages = body
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(value => value.trim());

    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  if (body && typeof body === 'object') {
    const message = readMessageFromBody((body as { message?: unknown }).message);
    if (message) {
      return message;
    }

    const error = readMessageFromBody((body as { error?: unknown }).error);
    if (error) {
      return error;
    }
  }

  return null;
}

export async function parseApiErrorResponse(res: Response): Promise<string> {
  const parsedBody = await res
    .clone()
    .json()
    .catch(() => null);
  const bodyMessage = readMessageFromBody(parsedBody);
  if (bodyMessage) {
    return bodyMessage;
  }

  const text = await res.text().catch(() => '');
  if (text.trim()) {
    return text.trim();
  }

  return `Request failed with status ${res.status}`;
}

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(buildApiUrl(path), init);
  if (!res.ok) {
    throw new Error(await parseApiErrorResponse(res));
  }
  return res;
}

export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchApi(path, init);
  return (await res.json()) as T;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchApiJson<T>(path, init);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function extractArrayPayload(value: unknown, keys: string[] = ['data', 'items', 'results', 'payload']): unknown[] | null {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of keys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isRecord(candidate)) {
      const nested = extractArrayPayload(candidate, keys);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

export function extractObjectPayload(value: unknown, keys: string[] = ['data', 'item', 'result', 'payload']): Record<string, unknown> | null {
  if (isRecord(value)) {
    for (const key of keys) {
      const candidate = value[key];
      if (isRecord(candidate)) {
        return candidate;
      }
    }

    return value;
  }

  return null;
}
