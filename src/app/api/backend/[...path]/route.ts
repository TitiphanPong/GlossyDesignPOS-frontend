import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME, verifyAdminSession } from '@/lib/admin-auth';

const PUBLIC_POST_PATHS = new Set(['uploads', 'upload', 'tracking/lookup']);

function getBackendUrl(path: string[], search: string): string {
  const base = process.env.BACKEND_API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) throw new Error('Backend API is not configured');
  return `${base.replace(/\/+$/u, '')}/${path.map(encodeURIComponent).join('/')}${search}`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const isPublicPost = request.method === 'POST' && PUBLIC_POST_PATHS.has(path.join('/'));
  const cookie = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const session = await verifyAdminSession(cookie);
  if (!session?.accessToken && !isPublicPost) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const headers = new Headers(request.headers);
    headers.delete('cookie');
    headers.delete('host');
    if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);

    const response = await fetch(getBackendUrl(path, request.nextUrl.search), {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });
    const responseHeaders = new Headers(response.headers);

    // fetch() transparently decompresses the upstream body. Forwarding the
    // original encoding/length headers makes browsers try to decode it again.
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ message: 'Backend service is unavailable' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
