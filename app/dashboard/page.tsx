'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/src/hooks/auth/useAuth';

export default function DashboardRedirect() {
  const router = useRouter();
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth.isInitialized) return;

    if (!auth.accessToken) {
      router.replace('/login');
      return;
    }

    const roles = auth.user?.roles ?? [];
    if (roles.includes('ADMIN')) {
      router.replace('/dashboard/admin');
    } else if (roles.includes('ORGANIZER')) {
      router.replace('/dashboard/organizer');
    } else {
      router.replace('/dashboard/customer');
    }
  }, [auth.isInitialized, auth.accessToken, auth.user?.roles, router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
