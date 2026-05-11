'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/src/hooks/auth/useAuth';

export default function PublicTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: eventId } = use(params);
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth.isInitialized) return;
    if (auth.accessToken) {
      router.replace(`/dashboard/customer/events/${eventId}/tickets`);
    } else {
      router.replace(`/login?redirect=${encodeURIComponent(`/dashboard/customer/events/${eventId}/tickets`)}`);
    }
  }, [auth.isInitialized, auth.accessToken, eventId, router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: '#F36BF9' }} />
      <Typography variant="body2" color="text.secondary">
        {auth.accessToken ? 'Loading checkout…' : 'Redirecting to login…'}
      </Typography>
    </Box>
  );
}
