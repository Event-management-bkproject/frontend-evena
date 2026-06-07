'use client';

import { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Grid, Pagination } from '@mui/material';
import { LocalFireDepartment, EventNote } from '@mui/icons-material';
import { useGetEventsSearchQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import CustomerEventCard from '@/src/components/EventCard/CustomerEventCard';
import EventSearchBar from '@/src/components/EventSearchBar';
import EventCategoryFilter from '@/src/components/EventCategoryFilter';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { calculateHotEvents } from '@/src/utils/hotEventsAlgorithm';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/hooks/auth/useAuth';

const PAGE_SIZE = 6;
const HOT_POOL_SIZE = 50;

type TimePeriod = 'today' | 'week' | 'month' | 'all';

function getDateRange(period: TimePeriod, specificDate?: string): { startDate?: string; endDate?: string } {
  if (specificDate) {
    const d = new Date(specificDate);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (period === 'week') {
    const start = new Date(now);
    const end = new Date(now); end.setDate(end.getDate() + 7);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (period === 'month') {
    const start = new Date(now);
    const end = new Date(now); end.setMonth(end.getMonth() + 1);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  return {};
}

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { auth } = useAuth();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const categories = categoriesResponse?.data ?? [];

  const isFiltering = !!(searchKeyword || searchCity || searchDate || selectedCategory || timePeriod !== 'all' || minPrice !== undefined || maxPrice !== undefined);
  const dateRange = getDateRange(timePeriod, searchDate);

  // Pool for hot events algorithm — fetch top 50 upcoming events, only when not filtering
  const { data: poolRes } = useGetEventsSearchQuery(
    { size: HOT_POOL_SIZE, sortBy: 'startAt', sortDirection: 'ASC' },
    { skip: isFiltering },
  );

  // Server-side filtered upcoming events
  const { data: searchRes, isLoading: searchLoading, isFetching, error: searchError } = useGetEventsSearchQuery({
    keyword: searchKeyword || undefined,
    categoryId: selectedCategory ?? undefined,
    city: searchCity || undefined,
    minPrice,
    maxPrice,
    sortBy: 'startAt',
    sortDirection: 'ASC',
    page,
    size: PAGE_SIZE,
    ...dateRange,
  });

  const poolEvents = poolRes?.data?.content ?? [];
  const upcomingEvents = searchRes?.data?.content ?? [];
  const totalPages = searchRes?.data?.totalPages ?? 0;
  const totalElements = searchRes?.data?.totalElements ?? 0;

  const hotEvents = useMemo(() => calculateHotEvents(poolEvents, 6), [poolEvents]);

  const handleSearch = useCallback((kw: string, pl: string, dt: string) => {
    setSearchKeyword(kw.trim());
    setSearchCity(pl.trim());
    setSearchDate(dt);
    setPage(0);
  }, []);

  const handleCategoryChange = useCallback((id: number | null) => {
    setSelectedCategory(id);
    setPage(0);
  }, []);

  const handleTimePeriodChange = useCallback((period: TimePeriod) => {
    setTimePeriod(period);
    setPage(0);
  }, []);

  if ((searchLoading || categoriesLoading) && !searchRes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#6093FC' }} />
      </Box>
    );
  }

  if (searchError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          pt: { xs: 5, md: 7 },
          pb: { xs: 9, md: 11 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -60, right: '10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(243,107,249,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(96,147,252,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{ color: 'rgba(255,255,255,0.55)', fontSize: { xs: 14, md: 15 }, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1.5 }}
          >
            {auth?.user?.name ? `Welcome back, ${auth.user.name.split(' ')[0]} 👋` : 'Discover Amazing Events'}
          </Typography>
          <Typography
            variant="h1"
            sx={{ color: '#fff', fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' }, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.2, mb: 1.5 }}
          >
            Find your next{' '}
            <Box component="span" sx={{ background: 'linear-gradient(90deg,#F36BF9,#6093FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              experience
            </Box>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: { xs: 14, md: 15 }, mb: 4 }}>
            Concerts, festivals, workshops and more — all in one place
          </Typography>
        </Container>
      </Box>

      {/* Search bar — overlapping hero */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, mb: 4, position: 'relative', zIndex: 10 }}>
        <EventSearchBar onSearch={handleSearch} />
      </Container>

      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ pb: 8 }}>

          {/* Hot events — only when not actively filtering */}
          {!isFiltering && hotEvents.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalFireDepartment sx={{ color: '#FF4D00', fontSize: 26 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 20 }}>
                  {t('customer.hotEvents')}
                </Typography>
                <Box sx={{ ml: 1, px: 1.5, py: 0.25, borderRadius: '20px', bgcolor: 'rgba(255,77,0,0.1)' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FF4D00' }}>TRENDING</Typography>
                </Box>
              </Box>
              <Grid container spacing={3}>
                {hotEvents.map((event) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                    <CustomerEventCard event={event} hot />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Category + time period filters */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: '16px',
              p: 2.5,
              mb: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              border: '1px solid #F1F5F9',
            }}
          >
            <EventCategoryFilter
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onTimePeriodChange={handleTimePeriodChange}
              onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); setPage(0); }}
            />
          </Box>

          {/* Upcoming / search results */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <EventNote sx={{ color: '#6093FC', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 20 }}>
                {isFiltering ? 'Search Results' : t('customer.upcomingEvents')}
              </Typography>
              <Box sx={{ ml: 0.5, px: 1.5, py: 0.25, borderRadius: '20px', bgcolor: '#F1F5F9' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{totalElements}</Typography>
              </Box>
            </Box>

            {isFetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#6093FC' }} size={32} />
              </Box>
            ) : upcomingEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EventNote sx={{ fontSize: 56, color: '#E2E8F0', mb: 2 }} />
                <Typography variant="h6" color="#64748B" sx={{ mb: 1 }}>
                  {t('customer.noEventsFound')}
                </Typography>
                <Typography variant="body2" color="#94A3B8">
                  Try adjusting your filters or search terms
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {upcomingEvents.map((event) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                    <CustomerEventCard event={event} />
                  </Grid>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, v) => { setPage(v - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  sx={{ '& .Mui-selected': { bgcolor: '#6093FC !important', color: 'white' } }}
                />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
