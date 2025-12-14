'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Public events page - Redirects to login
 * Events browsing requires authentication
 */
export default function PublicEventsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login?redirect=/dashboard/customer');
  }, [router]);

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
