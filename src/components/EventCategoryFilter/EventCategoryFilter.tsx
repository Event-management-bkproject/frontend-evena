'use client';

import React, { useState } from 'react';
import { Box, Chip, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { CategoryResponse } from '@/src/stores/types';

interface EventCategoryFilterProps {
  categories: CategoryResponse[];
  onCategoryChange: (categoryId: number | null) => void;
  onTimePeriodChange: (period: 'today' | 'week' | 'month' | 'all') => void;
}

export default function EventCategoryFilter({
  categories,
  onCategoryChange,
  onTimePeriodChange,
}: EventCategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const handleCategoryClick = (categoryId: number) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    onCategoryChange(newCategory);
  };

  const handleTimePeriodChange = (event: any) => {
    const period = event.target.value;
    setTimePeriod(period);
    onTimePeriodChange(period);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Time Period Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2A3363', minWidth: '100px' }}>
          Time Period:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={timePeriod}
            onChange={handleTimePeriodChange}
            sx={{
              borderRadius: '20px',
              backgroundColor: '#F7F7F7',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: '#F36BF9',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#F36BF9',
              },
            }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Category Chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2A3363', minWidth: '100px' }}>
          Categories:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => {
              setSelectedCategory(null);
              onCategoryChange(null);
            }}
            sx={{
              backgroundColor: selectedCategory === null ? '#F36BF9' : '#F7F7F7',
              color: selectedCategory === null ? 'white' : '#666',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: selectedCategory === null ? '#e55ae0' : '#EFEFEF',
              },
            }}
          />
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              onClick={() => handleCategoryClick(category.id)}
              sx={{
                backgroundColor: selectedCategory === category.id ? '#F36BF9' : '#F7F7F7',
                color: selectedCategory === category.id ? 'white' : '#666',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: selectedCategory === category.id ? '#e55ae0' : '#EFEFEF',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
