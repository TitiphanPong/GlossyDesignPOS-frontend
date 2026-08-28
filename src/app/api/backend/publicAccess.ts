const PUBLIC_POST_PATHS = new Set([
  'uploads',
  'upload',
  'tracking/lookup',
  'tracking/token',
]);

export function isPublicBackendRequest(method: string, path: string[]): boolean {
  return method.toUpperCase() === 'POST' && PUBLIC_POST_PATHS.has(path.join('/'));
}
