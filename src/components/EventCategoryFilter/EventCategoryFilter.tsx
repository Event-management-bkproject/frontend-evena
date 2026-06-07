'use client';

import React, { useState } from 'react';
import { Box, Typography, Chip, ToggleButton, ToggleButtonGroup, TextField, InputAdornment } from '@mui/material';
import { CalendarToday, TodayOutlined, DateRange, AllInclusive, AttachMoney } from '@mui/icons-material';
import { CategoryResponse } from '@/src/stores/types';
import { useTranslation } from 'react-i18next';

interface EventCategoryFilterProps {
  categories: CategoryResponse[];
  onCategoryChange: (categoryId: number | null) => void;
  onTimePeriodChange: (period: 'today' | 'week' | 'month' | 'all') => void;
  onPriceChange?: (min: number | undefined, max: number | undefined) => void;
}

const TIME_OPTIONS: { value: 'all' | 'today' | 'week' | 'month'; icon: React.ReactNode; labelKey: string }[] = [
  { value: 'all', icon: <AllInclusive sx={{ fontSize: 16 }} />, labelKey: 'filter.allTime' },
  { value: 'today', icon: <TodayOutlined sx={{ fontSize: 16 }} />, labelKey: 'filter.today' },
  { value: 'week', icon: <DateRange sx={{ fontSize: 16 }} />, labelKey: 'filter.thisWeek' },
  { value: 'month', icon: <CalendarToday sx={{ fontSize: 16 }} />, labelKey: 'filter.thisMonth' },
];

export default function EventCategoryFilter({ categories, onCategoryChange, onTimePeriodChange, onPriceChange }: EventCategoryFilterProps) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handlePriceBlur = () => {
    if (!onPriceChange) return;
    onPriceChange(
      minPrice !== '' ? parseFloat(minPrice) : undefined,
      maxPrice !== '' ? parseFloat(maxPrice) : undefined,
    );
  };

  const handleCategoryClick = (id: number) => {
    const next = selectedCategory === id ? null : id;
    setSelectedCategory(next);
    onCategoryChange(next);
  };

  const handleTimeChange = (_: React.MouseEvent<HTMLElement>, val: 'today' | 'week' | 'month' | 'all') => {
    if (!val) return;
    setTimePeriod(val);
    onTimePeriodChange(val);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Time filter */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13, minWidth: 70, flexShrink: 0 }}>
          {t('filter.timePeriod')}
        </Typography>
        <ToggleButtonGroup
          value={timePeriod}
          exclusive
          onChange={handleTimeChange}
          size="small"
          sx={{
            gap: 0.5,
            flexWrap: 'wrap',
            '& .MuiToggleButtonGroup-grouped': { border: 'none', borderRadius: '20px !important', mx: 0 },
          }}
        >
          {TIME_OPTIONS.map((opt) => (
            <ToggleButton
              key={opt.value}
              value={opt.value}
              disableRipple
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 0.6,
                fontSize: { xs: 12, sm: 13 },
                fontWeight: 600,
                textTransform: 'none',
                color: '#64748B',
                bgcolor: '#F8FAFC',
                display: 'flex',
                gap: 0.75,
                borderRadius: '20px !important',
                transition: 'all 0.15s',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
                  color: '#fff',
                  boxShadow: '0 3px 10px rgba(96,147,252,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)' },
                },
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              {opt.icon}
              {t(opt.labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Price range */}
      {onPriceChange && (
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 70, flexShrink: 0 }}>
            <AttachMoney sx={{ fontSize: 15, color: '#94A3B8' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>
              Price (₫)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small" type="number" placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceBlur}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography fontSize={12} color="#94A3B8">₫</Typography></InputAdornment> } }}
              sx={{ width: 120, '& input': { fontSize: 13 }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <Typography color="#94A3B8" fontSize={14}>–</Typography>
            <TextField
              size="small" type="number" placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceBlur}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography fontSize={12} color="#94A3B8">₫</Typography></InputAdornment> } }}
              sx={{ width: 120, '& input': { fontSize: 13 }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </Box>
      )}

      {/* Category chips */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: 13, minWidth: 70, flexShrink: 0 }}>
          {t('filter.categories')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={t('filter.all')}
            onClick={() => { setSelectedCategory(null); onCategoryChange(null); }}
            sx={{
              fontWeight: 600,
              fontSize: 12,
              height: 30,
              borderRadius: '20px',
              bgcolor: selectedCategory === null ? undefined : '#F8FAFC',
              background: selectedCategory === null ? 'linear-gradient(135deg,#F36BF9,#6093FC)' : undefined,
              color: selectedCategory === null ? '#fff' : '#64748B',
              border: 'none',
              boxShadow: selectedCategory === null ? '0 3px 10px rgba(96,147,252,0.28)' : 'none',
              transition: 'all 0.15s',
              '&:hover': { opacity: 0.88 },
            }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              onClick={() => handleCategoryClick(cat.id)}
              sx={{
                fontWeight: 600,
                fontSize: 12,
                height: 30,
                borderRadius: '20px',
                bgcolor: selectedCategory === cat.id ? undefined : '#F8FAFC',
                background: selectedCategory === cat.id ? 'linear-gradient(135deg,#F36BF9,#6093FC)' : undefined,
                color: selectedCategory === cat.id ? '#fff' : '#64748B',
                border: 'none',
                boxShadow: selectedCategory === cat.id ? '0 3px 10px rgba(96,147,252,0.28)' : 'none',
                transition: 'all 0.15s',
                '&:hover': { opacity: 0.88 },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
