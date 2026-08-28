export const PUBLIC_UPLOAD_PROXY_BODY_LIMIT_BYTES = 25_000_000;
export const DEFAULT_PROXY_BODY_LIMIT_BYTES = 5_000_000;
export const BACKEND_PROXY_TIMEOUT_MS = 120_000;

export class ProxyBodyTooLargeError extends Error {
  constructor(limitBytes: number) {
    super(`Proxy request body exceeds ${limitBytes} bytes`);
    this.name = 'ProxyBodyTooLargeError';
  }
}

export function isUploadPath(path: string[]): boolean {
  return path.length === 1 && (path[0] === 'upload' || path[0] === 'uploads');
}

export function getProxyBodyLimit(path: string[]): number {
  return isUploadPath(path) ? PUBLIC_UPLOAD_PROXY_BODY_LIMIT_BYTES : DEFAULT_PROXY_BODY_LIMIT_BYTES;
}

export function contentLengthExceedsLimit(headers: Headers, limitBytes: number): boolean {
  const raw = headers.get('content-length');
  if (!raw) return false;

  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value > limitBytes;
}

export function createBoundedBodyStream(
  body: ReadableStream<Uint8Array>,
  limitBytes: number,
  onLimitExceeded: () => void,
): ReadableStream<Uint8Array> {
  let seen = 0;

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.byteLength;
        if (seen > limitBytes) {
          onLimitExceeded();
          controller.error(new ProxyBodyTooLargeError(limitBytes));
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );
}
