import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME, ADMIN_GUARD_REDIRECT_PATH, ADMIN_LOGIN_REDIRECT_PATH, verifyAdminSession } from './src/lib/admin-auth';

const PROTECTED_PREFIXES = ['/home', '/dashboard', '/orders', '/pos', '/storage', '/invoice', '/print/invoice'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value ?? null;
  const session = await verifyAdminSession(token);

  if (pathname === ADMIN_GUARD_REDIRECT_PATH) {
    if (session) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_REDIRECT_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (session) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(ADMIN_GUARD_REDIRECT_PATH, request.url);
  const target = `${pathname}${search}`;
  if (target && target !== '/') {
    redirectUrl.searchParams.set('redirectTo', target);
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/home/:path*', '/dashboard/:path*', '/orders/:path*', '/pos/:path*', '/storage/:path*', '/invoice/:path*', '/print/invoice/:path*', '/login'],
};
