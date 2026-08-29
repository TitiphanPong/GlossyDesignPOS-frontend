const PUBLIC_POST_PATHS = new Set([
  'uploads',
  'tracking/lookup',
  'tracking/token',
]);

const PUBLIC_GET_PATHS = new Set([
  'customer-display/state',
  'customer-display/events',
]);

export function isPublicBackendRequest(method: string, path: string[]): boolean {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = path.join('/');
  if (normalizedMethod === 'POST') return PUBLIC_POST_PATHS.has(normalizedPath);
  if (normalizedMethod === 'GET') return PUBLIC_GET_PATHS.has(normalizedPath);
  return false;
}
