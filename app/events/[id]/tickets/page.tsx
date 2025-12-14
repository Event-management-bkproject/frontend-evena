'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

/**
 * Public ticket purchase page - Redirects to login
 * Ticket purchases require authentication
 */
export default function PublicTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  useEffect(() => {
    // Redirect to login, then to the authenticated ticket purchase page
    router.push(`/login?redirect=/dashboard/customer/events/${eventId}/tickets`);
  }, [router, eventId]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
      }}
    >
      <CircularProgress sx={{ color: '#F36BF9' }} />
    </Box>
  );
}
