import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME, verifyAdminSession } from '@/lib/admin-auth';
import { isPublicBackendRequest } from '../publicAccess';
import {
  BACKEND_PROXY_TIMEOUT_MS,
  contentLengthExceedsLimit,
  createBoundedBodyStream,
  getProxyBodyLimit,
} from '../proxyPolicy';

function getBackendUrl(path: string[], search: string): string {
  const base = process.env.BACKEND_API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) throw new Error('Backend API is not configured');
  return `${base.replace(/\/+$/u, '')}/${path.map(encodeURIComponent).join('/')}${search}`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const isPublicRequest = isPublicBackendRequest(request.method, path);
  const cookie = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const session = await verifyAdminSession(cookie);
  if (!session?.accessToken && !isPublicRequest) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD' && request.body !== null;
  const bodyLimit = getProxyBodyLimit(path);
  if (hasBody && contentLengthExceedsLimit(request.headers, bodyLimit)) {
    return NextResponse.json({ message: 'Request body is too large' }, { status: 413 });
  }

  const upstreamAbort = new AbortController();
  let bodyLimitExceeded = false;
  let upstreamTimedOut = false;
  const onClientAbort = () => upstreamAbort.abort(request.signal.reason);
  request.signal.addEventListener('abort', onClientAbort, { once: true });
  const timeout = setTimeout(() => {
    upstreamTimedOut = true;
    upstreamAbort.abort(new Error('Backend proxy timeout'));
  }, BACKEND_PROXY_TIMEOUT_MS);

  try {
    const headers = new Headers(request.headers);
    headers.delete('cookie');
    headers.delete('host');
    if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);

    const body = hasBody
      ? createBoundedBodyStream(request.body!, bodyLimit, () => {
          bodyLimitExceeded = true;
          upstreamAbort.abort(new Error('Proxy request body limit exceeded'));
        })
      : undefined;

    const init: RequestInit & { duplex?: 'half' } = {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
      signal: upstreamAbort.signal,
    };
    if (body) init.duplex = 'half';

    const response = await fetch(getBackendUrl(path, request.nextUrl.search), init);
    const responseHeaders = new Headers(response.headers);

    // fetch() transparently decompresses the upstream body. Forwarding the
    // original encoding/length headers makes browsers try to decode it again.
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    const proxiedResponse = new NextResponse(response.body, { status: response.status, headers: responseHeaders });
    if (response.status === 401 && !isPublicRequest) {
      proxiedResponse.cookies.set({
        name: ADMIN_AUTH_COOKIE_NAME,
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      });
    }
    return proxiedResponse;
  } catch {
    if (bodyLimitExceeded) {
      return NextResponse.json({ message: 'Request body is too large' }, { status: 413 });
    }
    if (upstreamTimedOut) {
      return NextResponse.json({ message: 'Backend service timed out' }, { status: 504 });
    }
    return NextResponse.json({ message: 'Backend service is unavailable' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener('abort', onClientAbort);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
