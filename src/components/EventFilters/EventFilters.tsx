'use client';

import { Box, TextField, Select, MenuItem, FormControl, Button, InputAdornment, Typography, SelectChangeEvent } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EventFiltersProps } from './types';
import { EventStatus } from '@/src/stores/types/enums';

export function EventFilters({
  onSearch,
  onCategoryChange,
  onTimeRangeChange,
  onStatusChange,
  onCreateClick,
  categories,
  events = [],
  loading = false,
  disabled = false,
}: EventFiltersProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);

  const statusCounts = useMemo(() => {
    const counts = {
      [EventStatus.DRAFT]: 0,
      [EventStatus.PUBLISHED]: 0,
      [EventStatus.ONGOING]: 0,
      [EventStatus.COMPLETED]: 0,
      [EventStatus.CANCELLED]: 0,
    };
    events.forEach((event) => {
      if (event.status in counts) counts[event.status]++;
    });
    return counts;
  }, [events]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value;
    setCategory(value);
    onCategoryChange(value === '' ? null : Number(value));
  };

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as 'week' | 'month' | 'year' | 'all';
    setTimeRange(value);
    onTimeRangeChange(value);
  };

  const getStatusLabel = (status: EventStatus): string => {
    switch (status) {
      case EventStatus.DRAFT:      return t('common.status.draft');
      case EventStatus.PUBLISHED:  return t('common.status.published');
      case EventStatus.ONGOING:    return t('common.status.ongoing');
      case EventStatus.COMPLETED:  return t('common.status.completed');
      case EventStatus.CANCELLED:  return t('common.status.cancelled');
      default:                     return status;
    }
  };

  const handleStatusClick = (status: EventStatus) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
      onStatusChange(null);
    } else {
      setSelectedStatus(status);
      onStatusChange(status);
    }
  };

  const selectSx = {
    flex: '0 1 180px',
    minWidth: 140,
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      '& fieldset': { borderColor: '#E0E0E0' },
      '&:hover fieldset': { borderColor: '#B0B0B0' },
      '&.Mui-focused fieldset': { borderColor: '#f36bf9' },
    },
    '& .MuiSelect-select': { color: '#36437C' },
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Top row: Search + Filters + Create */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <TextField
          placeholder={t('searchBar.searchEvents') || 'Tìm kiếm sự kiện...'}
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={disabled || loading}
          sx={{
            flex: 1,
            minWidth: 180,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '& fieldset': { borderColor: '#E0E0E0' },
              '&:hover fieldset': { borderColor: '#B0B0B0' },
              '&.Mui-focused fieldset': { borderColor: '#f36bf9' },
            },
            '& .MuiInputBase-input::placeholder': { color: '#ADACAE', opacity: 1 },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#888' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Category Filter */}
        <FormControl sx={selectSx}>
          <Select value={category} onChange={handleCategoryChange} disabled={disabled || loading} displayEmpty inputProps={{ 'data-testid': 'filter-category' }}>
            <MenuItem value="">
              <em style={{ fontStyle: 'normal', color: '#888' }}>{t('event.filter.category')}</em>
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Time Range Filter */}
        <FormControl sx={selectSx}>
          <Select value={timeRange} onChange={handleTimeRangeChange} disabled={disabled || loading} displayEmpty>
            <MenuItem value="all">{t('event.filter.allTime')}</MenuItem>
            <MenuItem value="week">{t('event.filter.thisWeek')}</MenuItem>
            <MenuItem value="month">{t('event.filter.thisMonth')}</MenuItem>
            <MenuItem value="year">{t('event.filter.thisYear')}</MenuItem>
          </Select>
        </FormControl>

        {/* Create Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateClick}
          disabled={disabled || loading}
          sx={{
            flex: '0 0 auto',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '16px',
            borderRadius: '12px',
            padding: '12px 24px',
            backgroundColor: '#F36BF9',
            color: 'white',
            whiteSpace: 'nowrap',
            '&:hover': { backgroundColor: '#e55ae0' },
            '&:disabled': { backgroundColor: '#cccccc', color: '#666666' },
          }}
        >
          {t('event.create')}
        </Button>
      </Box>

      {/* Status stats row */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          overflow: 'hidden',
        }}
      >
        {Object.entries(statusCounts).map(([status, count], idx) => {
          const active = selectedStatus === status;
          const statusMeta: Record<string, { color: string; bg: string }> = {
            DRAFT:     { color: '#888',    bg: '#F5F5F5' },
            PUBLISHED: { color: '#2E7D32', bg: '#E8F5E9' },
            ONGOING:   { color: '#283593', bg: '#E8EAF6' },
            COMPLETED: { color: '#1565C0', bg: '#E3F2FD' },
            CANCELLED: { color: '#C62828', bg: '#FFEBEE' },
          };
          const meta = statusMeta[status] ?? { color: '#36437C', bg: '#EEF0FA' };
          return (
            <Box
              key={status}
              data-testid={`status-card-${status.toLowerCase()}`}
              onClick={() => handleStatusClick(status as EventStatus)}
              sx={{
                flex: 1,
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                borderLeft: idx > 0 ? '1px solid #E0E0E0' : 'none',
                backgroundColor: active ? meta.bg : 'transparent',
                transition: 'background-color 0.2s',
                '&:hover': { backgroundColor: meta.bg },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25,
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ color: active ? meta.color : '#2A3363', lineHeight: 1 }}>
                {count}
              </Typography>
              <Typography variant="caption" sx={{ color: active ? meta.color : '#888', fontWeight: active ? 600 : 400, fontSize: '11px' }}>
                {getStatusLabel(status as EventStatus)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default EventFilters;
