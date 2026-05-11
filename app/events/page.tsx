'use client';

import { useState } from 'react';
import { Box, Container, Typography, CircularProgress, Pagination } from '@mui/material';
import { EventNote } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import CustomerEventCard from '@/src/components/EventCard/CustomerEventCard';
import { useGetEventsQuery } from '@/src/stores/services/EventApi';

const PAGE_SIZE = 12;

export default function PublicEventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useGetEventsQuery({ page, size: PAGE_SIZE });

  const events = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Page header */}
      <Box sx={{ background: 'linear-gradient(135deg, #ED4690 0%, #5522CC 100%)', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '2.8rem' } }}>
            Upcoming Events
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Discover concerts, festivals, and more happening near you
          </Typography>
        </Container>
      </Box>

      {/* Results */}
      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        {!isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {totalElements} upcoming event{totalElements !== 1 ? 's' : ''}
          </Typography>
        )}

        {(isLoading || isFetching) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#F36BF9' }} />
          </Box>
        )}

        {!isLoading && !isFetching && events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <EventNote sx={{ fontSize: 72, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No upcoming events.</Typography>
            <Typography variant="body2" color="text.secondary">Check back soon!</Typography>
          </Box>
        )}

        {!isLoading && events.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
            {events.map((event) => (
              <CustomerEventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/events/${event.id}`)}
              />
            ))}
          </Box>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, v) => { setPage(v - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              sx={{ '& .Mui-selected': { bgcolor: '#F36BF9 !important', color: 'white' } }}
            />
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
