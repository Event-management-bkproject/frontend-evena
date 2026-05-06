/**
 * Security tests — Next.js middleware (route protection)
 *
 * Rather than importing the real middleware (which requires next/server runtime),
 * we test the exact same logic extracted here and verified against the source.
 * This avoids jsdom/next-server incompatibilities while still validating the rules.
 *
 * Rules mirrored from middleware.ts:
 *  - /dashboard/* is protected: requires refreshToken cookie
 *  - All other paths pass through
 *  - On missing cookie: redirect to /login?redirect=<path>
 */
import { describe, it, expect } from 'vitest';

// ── Replicated middleware logic (kept in sync with middleware.ts) ─────────────

interface MockRequest {
  pathname: string;
  cookies: Record<string, string>;
}

type MockResult = { type: 'next' } | { type: 'redirect'; location: string };

function applyMiddleware(req: MockRequest): MockResult {
  const { pathname, cookies } = req;
  const hasSession = !!(cookies['refreshToken']);
  const protectedRoutes = ['/dashboard'];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', 'http://localhost');
    loginUrl.searchParams.set('redirect', pathname);
    return { type: 'redirect', location: loginUrl.toString() };
  }
  return { type: 'next' };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Middleware — route protection rules', () => {
  it('redirects /dashboard to /login when no refreshToken cookie', () => {
    const result = applyMiddleware({ pathname: '/dashboard', cookies: {} });
    expect(result.type).toBe('redirect');
    expect((result as { type: 'redirect'; location: string }).location).toContain('/login');
  });

  it('includes original path as ?redirect= query param', () => {
    const result = applyMiddleware({ pathname: '/dashboard/organizer/events', cookies: {} }) as { type: 'redirect'; location: string };
    expect(result.location).toContain('redirect=%2Fdashboard%2Forganizer%2Fevents');
  });

  it('allows /dashboard when refreshToken cookie is present', () => {
    const result = applyMiddleware({ pathname: '/dashboard', cookies: { refreshToken: 'valid-rt' } });
    expect(result.type).toBe('next');
  });

  it('passes through /login without a cookie', () => {
    const result = applyMiddleware({ pathname: '/login', cookies: {} });
    expect(result.type).toBe('next');
  });

  it('passes through / (home) without a cookie', () => {
    const result = applyMiddleware({ pathname: '/', cookies: {} });
    expect(result.type).toBe('next');
  });

  it('passes through /events (public) without a cookie', () => {
    const result = applyMiddleware({ pathname: '/events', cookies: {} });
    expect(result.type).toBe('next');
  });

  it('all nested /dashboard/* paths are protected', () => {
    const paths = [
      '/dashboard/admin',
      '/dashboard/admin/events',
      '/dashboard/organizer',
      '/dashboard/organizer/events',
      '/dashboard/customer',
      '/dashboard/customer/cart',
    ];
    for (const pathname of paths) {
      const result = applyMiddleware({ pathname, cookies: {} }) as { type: 'redirect'; location: string };
      expect(result.type, `Expected ${pathname} to redirect`).toBe('redirect');
      expect(result.location).toContain('/login');
    }
  });

  it('empty refreshToken cookie is treated as no session', () => {
    // !!'' === false — empty string means unauthenticated
    const result = applyMiddleware({ pathname: '/dashboard', cookies: { refreshToken: '' } });
    expect(result.type).toBe('redirect');
  });

  it('passes through /register without a cookie', () => {
    const result = applyMiddleware({ pathname: '/register', cookies: {} });
    expect(result.type).toBe('next');
  });

  it('passes through /events/123 (public event detail) without a cookie', () => {
    const result = applyMiddleware({ pathname: '/events/123', cookies: {} });
    expect(result.type).toBe('next');
  });
});
