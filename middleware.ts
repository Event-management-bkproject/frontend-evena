import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is enforced client-side by RoleGuard.
// The refreshToken cookie is set by api.evena.id.vn (backend domain) with
// path=/api/auth — browsers do not send it to evena.id.vn, so edge-level
// session detection is not possible without a same-domain cookie strategy.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
