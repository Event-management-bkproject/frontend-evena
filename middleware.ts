import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// refreshToken is set by the backend with path="/" and domain=COOKIE_DOMAIN (.evena.id.vn),
// so the browser sends it to evena.id.vn and this middleware can read it.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
