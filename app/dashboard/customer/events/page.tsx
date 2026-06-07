'use client';

import { useState, useCallback } from 'react';
import {
  Box, Container, Typography, CircularProgress, Pagination,
  TextField, Chip, ToggleButton, ToggleButtonGroup,
  InputAdornment, MenuItem, Select, FormControl,
  Divider, Collapse,
} from '@mui/material';
import { EventNote, Search, Place, CalendarToday, FilterList, AttachMoney, SwapVert } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import CustomerEventCard from '@/src/components/EventCard/CustomerEventCard';
import { useGetEventsSearchQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetAllCitiesQuery } from '@/src/stores/services/VenueApi';

const PAGE_SIZE = 12;

type TimePeriod = 'all' | 'today' | 'week' | 'month';
type SortBy = 'startAt' | 'title' | 'createdAt';
type SortDir = 'ASC' | 'DESC';

function getDateRange(period: TimePeriod): { startDate?: string; endDate?: string } {
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (period === 'week') {
    const end = new Date(now); end.setDate(end.getDate() + 7);
    return { startDate: now.toISOString(), endDate: end.toISOString() };
  }
  if (period === 'month') {
    const end = new Date(now); end.setMonth(end.getMonth() + 1);
    return { startDate: now.toISOString(), endDate: end.toISOString() };
  }
  return {};
}

const chipSx = (active: boolean) => ({
  fontWeight: 600,
  fontSize: 12,
  height: 30,
  borderRadius: '20px',
  bgcolor: active ? undefined : '#F8FAFC',
  background: active ? 'linear-gradient(135deg,#F36BF9,#6093FC)' : undefined,
  color: active ? '#fff' : '#64748B',
  border: 'none',
  boxShadow: active ? '0 3px 10px rgba(96,147,252,0.28)' : 'none',
  transition: 'all 0.15s',
  cursor: 'pointer',
  '&:hover': { opacity: 0.88 },
});

const fieldSx = {
  '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
  '& .MuiInputBase-input': { fontSize: 14, color: '#0F172A' },
  '& .MuiInputBase-input::placeholder': { color: '#94A3B8' },
};

export default function CustomerEventsPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('startAt');
  const [sortDir, setSortDir] = useState<SortDir>('ASC');
  const [showFilters, setShowFilters] = useState(false);

  const dateRange = getDateRange(timePeriod);

  const { data, isLoading, isFetching } = useGetEventsSearchQuery({
    page,
    size: PAGE_SIZE,
    keyword: keyword || undefined,
    categoryId: selectedCategory,
    city: selectedCity || undefined,
    minPrice: minPrice !== '' ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice !== '' ? parseFloat(maxPrice) : undefined,
    sortBy,
    sortDirection: sortDir,
    ...dateRange,
  });

  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: citiesRes } = useGetAllCitiesQuery();

  const events = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;
  const categories = categoriesRes?.data ?? [];
  const cities: string[] = citiesRes?.data ?? [];

  const handleSearch = useCallback(() => {
    setKeyword(inputKeyword);
    setPage(0);
  }, [inputKeyword]);

  const handleReset = () => {
    setKeyword(''); setInputKeyword('');
    setSelectedCategory(undefined); setSelectedCity('');
    setTimePeriod('all'); setMinPrice(''); setMaxPrice('');
    setSortBy('startAt'); setSortDir('ASC');
    setPage(0);
  };

  const hasActiveFilters = keyword || selectedCategory || selectedCity || timePeriod !== 'all' || minPrice || maxPrice;

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        py: { xs: 5, md: 7 },
        pb: { xs: 9, md: 11 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -60, right: '10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(243,107,249,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '2.8rem' } }}>
            All Events
          </Typography>
          <Typography sx={{ opacity: 0.7, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            Discover concerts, festivals, workshops and more
          </Typography>
        </Container>
      </Box>

      {/* Search + Filter bar */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, mb: 2, position: 'relative', zIndex: 10 }}>
        <Box sx={{
          bgcolor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          border: '1px solid #F1F5F9',
          overflow: 'hidden',
          p: { xs: 1.5, sm: 0.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}>
          {/* Keyword */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 2, px: 1, py: { xs: 0.5, sm: 0 } }}>
            <Search sx={{ color: '#94A3B8', fontSize: 20, mr: 1, flexShrink: 0 }} />
            <TextField
              variant="outlined" placeholder="Search events..."
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              fullWidth size="small" sx={fieldSx}
            />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: '#F1F5F9', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

          {/* City */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1.3, px: 1, py: { xs: 0.5, sm: 0 } }}>
            <Place sx={{ color: '#94A3B8', fontSize: 20, mr: 1, flexShrink: 0 }} />
            <FormControl fullWidth size="small" sx={{ '& fieldset': { border: 'none' } }}>
              <Select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setPage(0); }}
                displayEmpty
                sx={{ fontSize: 14, color: selectedCity ? '#0F172A' : '#94A3B8' }}
              >
                <MenuItem value=""><em>All cities</em></MenuItem>
                {cities.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: '#F1F5F9', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

          {/* Actions */}
          <Box sx={{ flexShrink: 0, px: 1, py: { xs: 0.5, sm: 0.5 }, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              onClick={() => setShowFilters(p => !p)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 1, borderRadius: '12px', cursor: 'pointer',
                bgcolor: showFilters ? '#F1F5F9' : 'transparent',
                color: '#64748B', fontWeight: 600, fontSize: 13,
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <FilterList sx={{ fontSize: 18 }} />
              Filters {hasActiveFilters ? '(active)' : ''}
            </Box>
            <Box
              onClick={handleSearch}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 2.5, py: 1, borderRadius: '12px', cursor: 'pointer',
                background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
                whiteSpace: 'nowrap',
                '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)' },
              }}
            >
              <Search sx={{ fontSize: 18 }} />
              Search
            </Box>
          </Box>
        </Box>

        {/* Expanded filters */}
        <Collapse in={showFilters}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9', borderTop: 'none', p: 3, mt: -0.5 }}>

            {/* Time period */}
            <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 90, flexShrink: 0 }}>
                <CalendarToday sx={{ fontSize: 15, color: '#94A3B8' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Time</Typography>
              </Box>
              <ToggleButtonGroup
                value={timePeriod} exclusive
                onChange={(_: React.MouseEvent<HTMLElement>, val: TimePeriod) => { if (!val) return; setTimePeriod(val); setPage(0); }}
                size="small"
                sx={{ gap: 0.5, flexWrap: 'wrap', '& .MuiToggleButtonGroup-grouped': { border: 'none', borderRadius: '20px !important', mx: 0 } }}
              >
                {([['all', 'All time'], ['today', 'Today'], ['week', 'This week'], ['month', 'This month']] as [TimePeriod, string][]).map(([val, label]) => (
                  <ToggleButton key={val} value={val} disableRipple sx={{
                    px: 2, py: 0.6, fontSize: 12, fontWeight: 600, textTransform: 'none',
                    color: '#64748B', bgcolor: '#F8FAFC', borderRadius: '20px !important',
                    '&.Mui-selected': { background: 'linear-gradient(135deg,#F36BF9,#6093FC)', color: '#fff', boxShadow: '0 3px 10px rgba(96,147,252,0.3)' },
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}>{label}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Categories */}
            <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13, minWidth: 90, flexShrink: 0 }}>Category</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="All" onClick={() => { setSelectedCategory(undefined); setPage(0); }} sx={chipSx(selectedCategory === undefined)} />
                {categories.map((cat) => (
                  <Chip key={cat.id} label={cat.name} onClick={() => { setSelectedCategory(prev => prev === cat.id ? undefined : cat.id); setPage(0); }} sx={chipSx(selectedCategory === cat.id)} />
                ))}
              </Box>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Price + Sort */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoney sx={{ fontSize: 15, color: '#94A3B8' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Price range (VND)</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <TextField
                    size="small" type="number" placeholder="Min" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={() => setPage(0)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography fontSize={12} color="#94A3B8">₫</Typography></InputAdornment> } }}
                    sx={{ width: 130, '& input': { fontSize: 13 } }}
                  />
                  <Typography color="#94A3B8">–</Typography>
                  <TextField
                    size="small" type="number" placeholder="Max" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={() => setPage(0)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography fontSize={12} color="#94A3B8">₫</Typography></InputAdornment> } }}
                    sx={{ width: 130, '& input': { fontSize: 13 } }}
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SwapVert sx={{ fontSize: 15, color: '#94A3B8' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Sort by</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select value={sortBy} onChange={(e) => { setSortBy(e.target.value as SortBy); setPage(0); }} sx={{ fontSize: 13 }}>
                      <MenuItem value="startAt">Event date</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="createdAt">Recently added</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <Select value={sortDir} onChange={(e) => { setSortDir(e.target.value as SortDir); setPage(0); }} sx={{ fontSize: 13 }}>
                      <MenuItem value="ASC">Ascending</MenuItem>
                      <MenuItem value="DESC">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {hasActiveFilters && (
                <Box
                  onClick={handleReset}
                  sx={{ px: 2, py: 1, borderRadius: '10px', cursor: 'pointer', border: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, fontSize: 13, '&:hover': { bgcolor: '#F8FAFC' }, alignSelf: 'flex-end' }}
                >
                  Reset filters
                </Box>
              )}
            </Box>
          </Box>
        </Collapse>
      </Container>

      {/* Results */}
      <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
        {!isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {totalElements} event{totalElements !== 1 ? 's' : ''} found
              {hasActiveFilters && <Box component="span" sx={{ ml: 1, color: '#6093FC', fontWeight: 600 }}>· filtered</Box>}
            </Typography>
          </Box>
        )}

        {(isLoading || isFetching) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#F36BF9' }} />
          </Box>
        )}

        {!isLoading && !isFetching && events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <EventNote sx={{ fontSize: 72, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No events found.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {hasActiveFilters ? 'Try adjusting your filters.' : 'Check back soon!'}
            </Typography>
            {hasActiveFilters && (
              <Box onClick={handleReset} sx={{ mt: 2, display: 'inline-block', px: 3, py: 1, borderRadius: '10px', cursor: 'pointer', border: '1px solid #E2E8F0', color: '#6093FC', fontWeight: 600, fontSize: 14, '&:hover': { bgcolor: '#F8FAFC' } }}>
                Clear filters
              </Box>
            )}
          </Box>
        )}

        {!isLoading && events.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
            {events.map((event) => (
              <CustomerEventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/dashboard/customer/events/${event.id}`)}
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
