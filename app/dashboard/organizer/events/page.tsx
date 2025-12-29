// app/dashboard/organizer/events/page.tsx
'use client';

/**
 * NOTE: Page này vẫn là Client Component vì:
 * 1. ProtectedContent cần check auth (client-side)
 * 2. LayoutWithSidebar cần interactive state
 * 3. Auth token được lưu trong localStorage (client-only)
 *
 * ✅ OPTIMIZATION ĐÃ ÁP DỤNG:
 * - Server State (events, organizations, categories, venues) → RTK Query (unified caching, auto invalidation)
 * - Client State (modals, filters, sidebar) → Redux
 * - All CRUD operations properly invalidate related caches
 */

import { useAuth } from '@/src/hooks/auth/useAuth';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import EventsManagement from '@/src/components/EventsManagement/EventsManagement';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import { Box, CircularProgress } from '@mui/material';

function EventsPage() {
  const { auth } = useAuth();

  // Fetch public data với RTK Query (auto caching & invalidation)
  const { data: categoriesResponse, isLoading: loadingCategories } = useGetCategoriesQuery();
  const { data: venuesResponse, isLoading: loadingVenues } = useGetVenuesQuery({ page: 0, size: 100 });

  const categoriesData = categoriesResponse?.data || [];
  const venuesData = venuesResponse?.data?.content || [];

  if (loadingCategories || loadingVenues) {
    return (
      <ProtectedContent>
        <LayoutWithSidebar currentPage="events">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 20px)',
            }}
          >
            <CircularProgress />
          </Box>
        </LayoutWithSidebar>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      {/* <SSESync /> */}
      <LayoutWithSidebar currentPage="events">
        <EventsManagement
          initialCategories={categoriesData}
          initialVenues={venuesData}
          userName={auth.user?.name || 'User'}
        />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}

export default EventsPage;
