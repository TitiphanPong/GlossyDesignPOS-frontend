import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_SESSION_TTL_MS, canAdminLogin, createAdminSession, getAdminAuthConfig, verifyAdminSession } from '@/lib/admin-auth';

type LoginRequestBody = {
  username?: string;
  password?: string;
};

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

  return NextResponse.json({
    authenticated: Boolean(session),
    configured: Boolean(config),
    expiresAt: session?.expiresAt ?? null,
    username: session?.username ?? null,
  });
}

export async function POST(request: Request) {
  const config = getAdminAuthConfig();
  if (!config) {
    return NextResponse.json(
      {
        message: 'Admin authentication is not configured. Set ADMIN_LOGIN_USERNAME, ADMIN_LOGIN_PASSWORD, and ADMIN_SESSION_SECRET.',
      },
      { status: 503 },
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

  const authorized = await canAdminLogin(username, password);
  if (!authorized) {
    return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
  }

  const token = await createAdminSession(username);
  const response = NextResponse.json({ authenticated: true, username });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(ADMIN_AUTH_SESSION_TTL_MS / 1000),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  clearSessionCookie(response);
  return response;
}
