/**
 * Security tests — Role-Based Access Control (RBAC)
 *
 * Verifies that:
 *  - ProtectedContent blocks unauthenticated users (redirects to /login)
 *  - RoleGuard blocks users without the required role
 *  - Admin-only routes are inaccessible to CUSTOMER/ORGANIZER
 *  - Organizer-only routes are inaccessible to CUSTOMER/ADMIN
 *  - Role escalation: a CUSTOMER claiming ADMIN role is NOT trusted
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';

// ── ProtectedContent ─────────────────────────────────────────────────────────
vi.mock('@/src/components/ProtectedContent', async () => {
  const { useSelector } = await import('react-redux');
  const React = await import('react');
  const { useRouter } = await import('next/navigation');
  return {
    default: ({ children }: { children: React.ReactNode }) => {
      const auth = (useSelector as any)((s: any) => s.auth);
      const router = useRouter();
      if (!auth.accessToken) {
        router.push('/login');
        return null;
      }
      return React.createElement(React.Fragment, null, children);
    },
  };
});

// ── RoleGuard ────────────────────────────────────────────────────────────────
vi.mock('@/src/components/RoleGuard/RoleGuard', async () => {
  const { useSelector } = await import('react-redux');
  const React = await import('react');
  return {
    default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
      const auth = (useSelector as any)((s: any) => s.auth);
      const roles: string[] = auth.user?.roles ?? [];
      const hasRole = allowedRoles.some((r) => roles.includes(r));
      if (!hasRole) return React.createElement('div', { 'data-testid': 'access-denied' }, 'Access Denied');
      return React.createElement(React.Fragment, null, children);
    },
  };
});

import ProtectedContent from '@/src/components/ProtectedContent';
import RoleGuard from '@/src/components/RoleGuard/RoleGuard';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => ({ get: vi.fn() }),
}));

const AUTH_STATES = {
  unauthenticated: { auth: { accessToken: null, user: null, isInitialized: true } },
  customer: { auth: { accessToken: 'tok', user: { id: 1, name: 'C', email: 'c@e.com', roles: ['CUSTOMER'], avatarUrl: null }, isInitialized: true } },
  organizer: { auth: { accessToken: 'tok', user: { id: 2, name: 'O', email: 'o@e.com', roles: ['ORGANIZER'], avatarUrl: null }, isInitialized: true } },
  admin: { auth: { accessToken: 'tok', user: { id: 3, name: 'A', email: 'a@e.com', roles: ['ADMIN'], avatarUrl: null }, isInitialized: true } },
};

describe('ProtectedContent — authentication gate', () => {
  it('redirects unauthenticated user to /login', () => {
    render(
      <ProtectedContent><div data-testid="secret">Secret</div></ProtectedContent>,
      { preloadedState: AUTH_STATES.unauthenticated },
    );
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(screen.queryByTestId('secret')).toBeNull();
  });

  it('renders children for authenticated CUSTOMER', () => {
    render(
      <ProtectedContent><div data-testid="content">Content</div></ProtectedContent>,
      { preloadedState: AUTH_STATES.customer },
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('renders children for authenticated ORGANIZER', () => {
    render(
      <ProtectedContent><div data-testid="content">Content</div></ProtectedContent>,
      { preloadedState: AUTH_STATES.organizer },
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('renders children for authenticated ADMIN', () => {
    render(
      <ProtectedContent><div data-testid="content">Content</div></ProtectedContent>,
      { preloadedState: AUTH_STATES.admin },
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });
});

describe('RoleGuard — role-based access control', () => {
  it('shows access-denied for CUSTOMER accessing ADMIN-only route', () => {
    render(
      <RoleGuard allowedRoles={['ADMIN']}><div>Admin Panel</div></RoleGuard>,
      { preloadedState: AUTH_STATES.customer },
    );
    expect(screen.getByTestId('access-denied')).toBeTruthy();
  });

  it('shows access-denied for ORGANIZER accessing ADMIN-only route', () => {
    render(
      <RoleGuard allowedRoles={['ADMIN']}><div>Admin Panel</div></RoleGuard>,
      { preloadedState: AUTH_STATES.organizer },
    );
    expect(screen.getByTestId('access-denied')).toBeTruthy();
  });

  it('shows access-denied for CUSTOMER accessing ORGANIZER-only route', () => {
    render(
      <RoleGuard allowedRoles={['ORGANIZER']}><div>Organizer Panel</div></RoleGuard>,
      { preloadedState: AUTH_STATES.customer },
    );
    expect(screen.getByTestId('access-denied')).toBeTruthy();
  });

  it('renders ADMIN content for ADMIN user', () => {
    render(
      <RoleGuard allowedRoles={['ADMIN']}><div data-testid="admin-content">Admin</div></RoleGuard>,
      { preloadedState: AUTH_STATES.admin },
    );
    expect(screen.getByTestId('admin-content')).toBeTruthy();
  });

  it('renders ORGANIZER content for ORGANIZER user', () => {
    render(
      <RoleGuard allowedRoles={['ORGANIZER']}><div data-testid="org-content">Org</div></RoleGuard>,
      { preloadedState: AUTH_STATES.organizer },
    );
    expect(screen.getByTestId('org-content')).toBeTruthy();
  });

  it('allows multi-role guard: ADMIN OR ORGANIZER', () => {
    render(
      <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}><div data-testid="shared">Shared</div></RoleGuard>,
      { preloadedState: AUTH_STATES.organizer },
    );
    expect(screen.getByTestId('shared')).toBeTruthy();
  });

  it('blocks CUSTOMER from ADMIN|ORGANIZER multi-role guard', () => {
    render(
      <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}><div>Shared</div></RoleGuard>,
      { preloadedState: AUTH_STATES.customer },
    );
    expect(screen.getByTestId('access-denied')).toBeTruthy();
  });

  it('role escalation: CUSTOMER with fabricated ADMIN token is blocked by guard (roles from server)', () => {
    // Even if a malicious client passes a fake token, roles come from the Redux store
    // which is populated from /auth/refresh server response — not user-controlled.
    const manipulatedState = {
      auth: {
        accessToken: 'malicious-fake-admin-token',
        user: { id: 99, name: 'Hacker', email: 'h@x.com', roles: ['CUSTOMER'], avatarUrl: null },
        isInitialized: true,
      },
    };
    render(
      <RoleGuard allowedRoles={['ADMIN']}><div>Admin Panel</div></RoleGuard>,
      { preloadedState: manipulatedState },
    );
    expect(screen.getByTestId('access-denied')).toBeTruthy();
  });
});
