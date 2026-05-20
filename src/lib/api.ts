export function getApiBaseUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error('Missing NEXT_PUBLIC_API_URL. Please configure environment variables before making API requests.');
  }
  return apiBase;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
