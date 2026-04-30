import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // refreshToken httpOnly cookie is the session signal at the edge.
  // Actual role-based access is enforced client-side by RoleGuard.
  const hasSession = !!request.cookies.get('refreshToken')?.value;

  const protectedRoutes = ['/dashboard'];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
