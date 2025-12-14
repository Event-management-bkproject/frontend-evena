// middleware.ts (ở root project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;
  const protectedRoutes = ['/dashboard/organizer', '/dashboard/customer', '/dashboard'];

  // Kiểm tra nếu đang truy cập protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 🚫 Redirect nếu truy cập protected route mà chưa đăng nhập
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔄 Redirect nếu đã đăng nhập mà truy cập login/register
  // REMOVED: This conflicts with useLogin's role-based redirect logic
  // The login hook handles post-login redirects based on user role
  // if (isAuthRoute && isAuthenticated) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
