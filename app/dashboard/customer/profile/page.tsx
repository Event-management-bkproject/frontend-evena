'use client';

import ProtectedContent from '@/src/components/ProtectedContent';
import Header from '@/src/components/Header';
import ProfilePage from '@/src/components/ProfilePage/ProfilePage';
import { Box, Container, Typography } from '@mui/material';
import { BRAND } from '@/src/utils/constants/constant';

export default function CustomerProfilePage() {
  return (
    <ProtectedContent>
      <Header />
      <Box sx={{ minHeight: '100vh', bgcolor: BRAND.bgPage, pt: 10, pb: 6 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight={700} color={BRAND.dark} sx={{ mb: 3 }}>
            My Profile
          </Typography>
          <ProfilePage />
        </Container>
      </Box>
    </ProtectedContent>
  );
}
