'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Grid } from '@mui/material';
import { LocalFireDepartment, Event } from '@mui/icons-material';
import { useGetEventsQuery, useGetPublicEventsQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import CustomerEventCard from '@/src/components/EventCard/CustomerEventCard';
import EventSearchBar from '@/src/components/EventSearchBar';
import EventCategoryFilter from '@/src/components/EventCategoryFilter';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { calculateHotEvents, filterUpcomingEvents } from '@/src/utils/hotEventsAlgorithm';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { lastEvent } = useSSE();

  // Search filters state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Fetch data
  const { data: eventsResponse, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useGetEventsQuery({});
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const events = eventsResponse?.data?.content || [];
  const categories = categoriesResponse?.data || [];

  // Listen to SSE events for real-time updates
  useEffect(() => {
    if (!lastEvent) return;

    console.log('📨 [CustomerDashboard] Received SSE event:', lastEvent.type);

    // Refetch events when event data changes (only PUBLISHED events visible to customers)
    switch (lastEvent.type) {
      case SSENormalizedType.EVENT_PUBLISHED:
      case SSENormalizedType.EVENT_UPDATED:
      case SSENormalizedType.EVENT_CANCELLED:
        console.log('🔄 [CustomerDashboard] Refetching events...');
        refetchEvents();
        break;
      default:
        break;
    }
  }, [lastEvent, refetchEvents]);

  // Calculate hot events using algorithm
  const hotEvents = useMemo(() => {
    return calculateHotEvents(events, 6);
  }, [events]);

  // Filter upcoming events
  const upcomingEvents = useMemo(() => {
    return filterUpcomingEvents(events, {
      categoryId: selectedCategory,
      timePeriod,
      searchKeyword,
      searchPlace,
      searchDate,
    });
  }, [events, selectedCategory, timePeriod, searchKeyword, searchPlace, searchDate]);

  const handleSearch = (keyword: string, place: string, date: string) => {
    setSearchKeyword(keyword);
    setSearchPlace(place);
    setSearchDate(date);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleTimePeriodChange = (period: 'today' | 'week' | 'month' | 'all') => {
    setTimePeriod(period);
  };

  if (eventsLoading || categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  if (eventsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Alert>
      </Container>
    );
  }

  return (
    <>
      {/* <SSESync /> */}
      <Box
        sx={{
          backgroundColor: '#FAFAFA',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Header cartItemCount={0} />

        {/* Main Content - flex: 1 pushes footer to bottom */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Page Title */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#2A3363',
                  mb: 1,
                }}
              >
                {t('customer.discoverEvents')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                {t('customer.discoverEventsSubtitle')}
              </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
              <EventSearchBar onSearch={handleSearch} />
            </Box>

            {/* Recommended/Hot Events Section */}
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalFireDepartment sx={{ color: '#F36BF9', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363' }}>
                  {t('customer.hotEvents')}
                </Typography>
              </Box>

              {hotEvents.length === 0 ? (
                <Alert severity="info">{t('customer.noHotEvents')}</Alert>
              ) : (
                <Grid container spacing={3}>
                  {hotEvents.map((event) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                      <CustomerEventCard event={event} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Filters for Upcoming Events */}
            <Box sx={{ mb: 3 }}>
              <EventCategoryFilter
                categories={categories}
                onCategoryChange={handleCategoryChange}
                onTimePeriodChange={handleTimePeriodChange}
              />
            </Box>

            {/* Upcoming Events Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Event sx={{ color: '#36437C', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363' }}>
                  {t('customer.upcomingEvents')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#999',
                    ml: 1,
                    mt: 0.5,
                  }}
                >
                  {t('customer.eventsCount', { count: upcomingEvents.length })}
                </Typography>
              </Box>

              {upcomingEvents.length === 0 ? (
                <Alert severity="info">
                  {t('customer.noEventsFound')}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {upcomingEvents.map((event) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                      <CustomerEventCard event={event} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Container>
        </Box>

        {/* Footer - Sticky at bottom */}
        <Footer />
      </Box>
    </>
  );
}
