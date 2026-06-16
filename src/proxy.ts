import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookieName, verifySessionToken } from '@/lib/auth/token';

const publicAdminRoutes = new Set(['/admin_group/login', '/admin_group/setup']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicAdminRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  const session = verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL('/admin_group/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin_group/admin') && !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return NextResponse.redirect(new URL('/admin_group', request.url));
  }

  if (
    (pathname.startsWith('/admin_group/admin/users') || pathname.startsWith('/admin_group/admin/settings')) &&
    session.role !== 'SUPERADMIN'
  ) {
    return NextResponse.redirect(new URL('/admin_group', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin_group/:path*'],
};
