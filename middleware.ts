import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is enforced client-side by RoleGuard.
// Edge-level redirect will be re-enabled once the backend deploys
// refreshToken with path=/ and COOKIE_DOMAIN=.evena.id.vn.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
