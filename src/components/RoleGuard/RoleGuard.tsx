'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Role-based access control guard
 *
 * Usage:
 * <RoleGuard allowedRoles={['ADMIN']}>
 *   <AdminDashboard />
 * </RoleGuard>
 */
export default function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { auth, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize
    if (!auth.isInitialized) {
      return;
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    // Authenticated but no roles → shouldn't happen, but handle it
    if (!auth.user?.roles || auth.user.roles.length === 0) {
      console.error('User has no roles assigned');
      router.push('/login');
      return;
    }

    // Check if user has any of the allowed roles
    // Support both "CUSTOMER" and "ROLE_CUSTOMER" formats
    console.log('[RoleGuard] User roles:', auth.user.roles);
    console.log('[RoleGuard] Allowed roles:', allowedRoles);

    const hasRequiredRole = auth.user.roles.some((role) => {
      // Check exact match
      if (allowedRoles.includes(role)) return true;
      // Check without ROLE_ prefix
      const roleWithoutPrefix = role.replace(/^ROLE_/, '');
      if (allowedRoles.includes(roleWithoutPrefix)) return true;
      // Check with ROLE_ prefix
      const roleWithPrefix = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
      if (allowedRoles.includes(roleWithPrefix)) return true;
      return false;
    });

    console.log('[RoleGuard] Has required role:', hasRequiredRole);

    if (!hasRequiredRole) {
      console.warn(`Access denied. User roles: ${auth.user.roles.join(', ')}, Required: ${allowedRoles.join(', ')}`);

      // Redirect based on user's actual role
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Auto-redirect to appropriate dashboard
        if (auth.user.roles.includes('ADMIN')) {
          router.push('/dashboard/admin');
        } else if (auth.user.roles.includes('ORGANIZER')) {
          router.push('/dashboard/organizer');
        } else if (auth.user.roles.includes('USER')) {
          router.push('/dashboard/customer');
        } else {
          router.push('/');
        }
      }
    }
  }, [auth.isInitialized, isAuthenticated, auth.user, allowedRoles, redirectTo, router]);

  // Loading state
  if (!auth.isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // No roles assigned
  if (!auth.user?.roles || auth.user.roles.length === 0) {
    return null; // Will redirect in useEffect
  }

  // Check role permission
  // Support both "CUSTOMER" and "ROLE_CUSTOMER" formats
  const hasRequiredRole = auth.user.roles.some((role) => {
    // Check exact match
    if (allowedRoles.includes(role)) return true;
    // Check without ROLE_ prefix
    const roleWithoutPrefix = role.replace(/^ROLE_/, '');
    if (allowedRoles.includes(roleWithoutPrefix)) return true;
    // Check with ROLE_ prefix
    const roleWithPrefix = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    if (allowedRoles.includes(roleWithPrefix)) return true;
    return false;
  });

  if (!hasRequiredRole) {
    // Don't show "Access Denied" screen, just show loading while redirecting
    // This provides better UX as the redirect happens in useEffect above
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Redirecting...</Typography>
      </Box>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
