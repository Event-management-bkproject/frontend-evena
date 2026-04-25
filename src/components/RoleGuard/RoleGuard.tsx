'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { Box, CircularProgress } from '@mui/material';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

function normalizeRole(role: string): string {
  return role.replace(/^ROLE_/, '');
}

function resolveHomePath(roles: string[]): string {
  if (roles.includes('ADMIN')) return '/dashboard/admin';
  if (roles.includes('ORGANIZER')) return '/dashboard/organizer';
  if (roles.includes('USER')) return '/dashboard/customer';
  return '/';
}

function Spinner() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { auth, isAuthenticated } = useAuth();
  const router = useRouter();

  const normalizedAllowed = useMemo(() => allowedRoles.map(normalizeRole), [allowedRoles]);

  const hasRequiredRole = useMemo(() => {
    if (!auth.user?.roles) return false;
    return auth.user.roles.some((r) => normalizedAllowed.includes(normalizeRole(r)));
  }, [auth.user?.roles, normalizedAllowed]);

  useEffect(() => {
    if (!auth.isInitialized) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${window.location.pathname}`);
      return;
    }

    if (!hasRequiredRole) {
      const userRoles = auth.user?.roles?.map(normalizeRole) ?? [];
      router.replace(redirectTo ?? resolveHomePath(userRoles));
    }
  }, [auth.isInitialized, isAuthenticated, hasRequiredRole, redirectTo, router, auth.user?.roles]);

  if (!auth.isInitialized || !isAuthenticated || !hasRequiredRole) {
    return <Spinner />;
  }

  return <>{children}</>;
}
