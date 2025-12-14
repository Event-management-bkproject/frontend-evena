'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Public event detail page - Redirects to login
 * Event viewing requires authentication
 */
export default function PublicEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  useEffect(() => {
    router.push(`/login?redirect=/dashboard/customer/events/${eventId}`);
  }, [router, eventId]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: '#F36BF9' }} />
      <Typography variant="body1" color="text.secondary">
        Redirecting to login...
      </Typography>
    </Box>
  );
}
