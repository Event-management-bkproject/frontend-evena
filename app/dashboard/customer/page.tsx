'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Grid } from '@mui/material';
import { LocalFireDepartment, Event } from '@mui/icons-material';
import { useGetEventsQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import CustomerEventCard from '@/src/components/EventCard/CustomerEventCard';
import EventSearchBar from '@/src/components/EventSearchBar';
import EventCategoryFilter from '@/src/components/EventCategoryFilter';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { calculateHotEvents, filterUpcomingEvents } from '@/src/utils/hotEventsAlgorithm';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@/src/utils/constants/constant';

// SSE cache invalidation is handled globally by SSEProvider.
// No manual refetch needed here — RTK Query re-fetches automatically
// when SSEProvider dispatches invalidateTags(['Event']).

export default function CustomerDashboard() {
  const { t } = useTranslation();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const { data: eventsResponse, isLoading: eventsLoading, error: eventsError } = useGetEventsQuery({});
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const events = eventsResponse?.data?.content ?? [];
  const categories = categoriesResponse?.data ?? [];

  const hotEvents = useMemo(() => calculateHotEvents(events, 6), [events]);

  const upcomingEvents = useMemo(
    () => filterUpcomingEvents(events, { categoryId: selectedCategory, timePeriod, searchKeyword, searchPlace, searchDate }),
    [events, selectedCategory, timePeriod, searchKeyword, searchPlace, searchDate],
  );

  const handleSearch = (keyword: string, place: string, date: string) => {
    setSearchKeyword(keyword);
    setSearchPlace(place);
    setSearchDate(date);
  };

  if (eventsLoading || categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: BRAND.primary }} />
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
    <Box sx={{ backgroundColor: BRAND.bgPage, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: BRAND.dark, mb: 1 }}>
              {t('customer.discoverEvents')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('customer.discoverEventsSubtitle')}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <EventSearchBar onSearch={handleSearch} />
          </Box>

          {/* Hot Events */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LocalFireDepartment sx={{ color: BRAND.primary, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND.dark }}>
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

          {/* Category + Time Filters */}
          <Box sx={{ mb: 3 }}>
            <EventCategoryFilter
              categories={categories}
              onCategoryChange={setSelectedCategory}
              onTimePeriodChange={setTimePeriod}
            />
          </Box>

          {/* Upcoming Events */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Event sx={{ color: BRAND.darkSecondary, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND.dark }}>
                {t('customer.upcomingEvents')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>
                {t('customer.eventsCount', { count: upcomingEvents.length })}
              </Typography>
            </Box>

            {upcomingEvents.length === 0 ? (
              <Alert severity="info">{t('customer.noEventsFound')}</Alert>
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

      <Footer />
    </Box>
  );
}
