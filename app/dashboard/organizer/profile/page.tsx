'use client';

import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import ProfilePage from '@/src/components/ProfilePage/ProfilePage';
import { Box } from '@mui/material';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { BRAND } from '@/src/utils/constants/constant';

export default function OrganizerProfilePage() {
  const { auth } = useAuth();

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="profile">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title="Profile"
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard/organizer' },
                { label: 'Profile' },
              ]}
              userName={auth.user?.name ?? 'User'}
              userAvatar={auth.user?.avatarUrl ?? undefined}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              px: '20px',
              py: '20px',
              overflow: 'auto',
              backgroundColor: BRAND.bgSection,
              borderRadius: '20px',
            }}
          >
            <ProfilePage />
          </Box>
        </Box>
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
