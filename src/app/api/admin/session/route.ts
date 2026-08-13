import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_SESSION_TTL_MS, createAdminSession, getAdminAuthConfig, verifyAdminSession } from '@/lib/admin-auth';

type LoginRequestBody = {
  username?: string;
  password?: string;
};

type BackendLoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: { username: string; role: 'staff' | 'manager' | 'admin' };
};

function backendUrl(path: string): string {
  const base = process.env.BACKEND_API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) throw new Error('Backend API is not configured');
  return `${base.replace(/\/+$/u, '')}${path}`;
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function GET(request: Request) {
const config = getAdminAuthConfig();
  const token = request.headers.get('cookie')?.match(new RegExp(`${ADMIN_AUTH_COOKIE_NAME}=([^;]+)`))?.[1] ?? null;
  const session = await verifyAdminSession(token);

  if (session?.accessToken) {
    try {
      const backendResponse = await fetch(backendUrl('/auth/me'), {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      if (backendResponse.ok) {
        return NextResponse.json({
          authenticated: true,
          configured: Boolean(config),
          expiresAt: session.expiresAt,
          username: session.username,
          role: session.role,
        });
      }

      if (backendResponse.status !== 401) {
        return NextResponse.json({ message: 'Authentication service is unavailable.' }, { status: 503 });
      }
    } catch {
      return NextResponse.json({ message: 'Authentication service is unavailable.' }, { status: 503 });
    }
  }

  const response = NextResponse.json({
    authenticated: false,
    configured: Boolean(config),
    expiresAt: null,
    username: null,
  });
  if (token) clearSessionCookie(response);
  return response;
}

export async function POST(request: Request) {
  const config = getAdminAuthConfig();
  if (!config) {
    return NextResponse.json(
      {
        message: 'Admin authentication is not configured. Set ADMIN_SESSION_SECRET.',
      },
      { status: 503 }
    );
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ message: 'Invalid login payload.' }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
  }

  let backendSession: BackendLoginResponse;
  try {
    const backendResponse = await fetch(backendUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!backendResponse.ok) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: backendResponse.status === 429 ? 429 : 401 });
    }
    backendSession = (await backendResponse.json()) as BackendLoginResponse;
  } catch {
    return NextResponse.json({ message: 'Authentication service is unavailable.' }, { status: 503 });
  }

  const token = await createAdminSession(backendSession.user.username, Date.now(), process.env, {
    accessToken: backendSession.accessToken,
    expiresAt: backendSession.expiresAt,
    role: backendSession.user.role,
  });
  const backendExpiryMs = Date.parse(backendSession.expiresAt);
  const cookieTtlMs = Number.isFinite(backendExpiryMs)
    ? Math.min(ADMIN_AUTH_SESSION_TTL_MS, Math.max(0, backendExpiryMs - Date.now()))
    : ADMIN_AUTH_SESSION_TTL_MS;
  const response = NextResponse.json({ authenticated: true, username: backendSession.user.username, role: backendSession.user.role });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(cookieTtlMs / 1000),
  });

  return response;
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ authenticated: false });
  const token = request.headers.get('cookie')?.match(new RegExp(`${ADMIN_AUTH_COOKIE_NAME}=([^;]+)`))?.[1] ?? null;
  const session = await verifyAdminSession(token);
  if (session?.accessToken) {
    await fetch(backendUrl('/auth/logout'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
      signal: AbortSignal.timeout(5000),
    }).catch(() => undefined);
  }
  clearSessionCookie(response);
  return response;
}
