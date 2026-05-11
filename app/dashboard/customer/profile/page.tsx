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
      <Box sx={{ minHeight: '100vh', bgcolor: BRAND.bgPage, pt: { xs: 4, md: 8 }, pb: { xs: 4, md: 6 } }}>
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight={700} color={BRAND.dark} sx={{ mb: 3, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
            My Profile
          </Typography>
          <ProfilePage />
        </Container>
      </Box>
    </ProtectedContent>
  );
}
