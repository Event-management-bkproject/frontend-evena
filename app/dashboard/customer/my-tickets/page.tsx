'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function MyTicketsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/customer/cart?tab=1');
  }, [router]);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress sx={{ color: '#6093FC' }} />
    </Box>
  );
}
