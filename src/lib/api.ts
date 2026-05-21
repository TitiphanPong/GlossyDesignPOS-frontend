export const MISSING_API_BASE_ERROR = 'missing_api_base';

export function hasApiBaseUrl(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

export function isMissingApiBaseError(error: unknown): boolean {
  return error instanceof Error && error.message === MISSING_API_BASE_ERROR;
}

export function getApiBaseUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error(MISSING_API_BASE_ERROR);
  }
  return apiBase;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
