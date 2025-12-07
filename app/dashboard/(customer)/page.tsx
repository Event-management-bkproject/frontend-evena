'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Grid } from '@mui/material';
import { LocalFireDepartment, Event } from '@mui/icons-material';
import { useGetPublicEventsQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import CustomerEventCard from '@/src/components/EventCard/CustomerEventCard';
import EventSearchBar from '@/src/components/EventSearchBar';
import EventCategoryFilter from '@/src/components/EventCategoryFilter';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { calculateHotEvents, filterUpcomingEvents } from '@/src/utils/hotEventsAlgorithm';

export default function CustomerDashboard() {

  // Search filters state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Fetch data
  const { data: eventsResponse, isLoading: eventsLoading, error: eventsError } = useGetPublicEventsQuery({});
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const events = eventsResponse?.data?.content || [];
  const categories = categoriesResponse?.data || [];

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
        <Alert severity="error">Failed to load events. Please try again later.</Alert>
      </Container>
    );
  }

  return (
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
              Discover Events
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Find and book tickets for the best events happening around you
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
                Hot Events
              </Typography>
            </Box>

            {hotEvents.length === 0 ? (
              <Alert severity="info">No hot events available at the moment. Check back later!</Alert>
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
                Upcoming Events
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#999',
                  ml: 1,
                  mt: 0.5,
                }}
              >
                ({upcomingEvents.length} events)
              </Typography>
            </Box>

            {upcomingEvents.length === 0 ? (
              <Alert severity="info">
                No events found matching your filters. Try adjusting your search criteria.
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
  );
}
