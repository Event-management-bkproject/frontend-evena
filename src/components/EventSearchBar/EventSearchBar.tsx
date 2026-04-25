'use client';

import React, { useState } from 'react';
import { Box, TextField, InputAdornment, Button, Divider } from '@mui/material';
import { Search, Place, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface EventSearchBarProps {
  onSearch: (keyword: string, place: string, date: string) => void;
}

export default function EventSearchBar({ onSearch }: EventSearchBarProps) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => onSearch(keyword, place, date);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const fieldSx = {
    flex: 1,
    minWidth: 0,
    '& .MuiOutlinedInput-root': {
      border: 'none',
      '& fieldset': { border: 'none' },
    },
    '& .MuiInputBase-input': { fontSize: 14, color: '#0F172A' },
    '& .MuiInputBase-input::placeholder': { color: '#94A3B8' },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        border: '1px solid #F1F5F9',
        overflow: 'hidden',
        px: 1,
        py: 0.5,
        gap: 0,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      {/* Keyword */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 2, minWidth: 180, px: 1 }}>
        <Search sx={{ color: '#94A3B8', fontSize: 20, mr: 1, flexShrink: 0 }} />
        <TextField
          variant="outlined"
          placeholder={t('searchBar.searchEvents')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          size="small"
          sx={fieldSx}
        />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#F1F5F9', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

      {/* Location */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1.5, minWidth: 150, px: 1 }}>
        <Place sx={{ color: '#94A3B8', fontSize: 20, mr: 1, flexShrink: 0 }} />
        <TextField
          variant="outlined"
          placeholder={t('searchBar.location')}
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          size="small"
          sx={fieldSx}
        />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#F1F5F9', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

      {/* Date */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1.2, minWidth: 140, px: 1 }}>
        <CalendarToday sx={{ color: '#94A3B8', fontSize: 18, mr: 1, flexShrink: 0 }} />
        <TextField
          variant="outlined"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          size="small"
          sx={{ ...fieldSx, '& .MuiInputBase-input': { ...fieldSx['& .MuiInputBase-input'], colorScheme: 'light' } }}
        />
      </Box>

      {/* Search Button */}
      <Box sx={{ px: 1, py: 0.5, flexShrink: 0 }}>
        <Button
          onClick={handleSearch}
          variant="contained"
          startIcon={<Search />}
          sx={{
            background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 14,
            px: 2.5,
            py: 1,
            boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
            whiteSpace: 'nowrap',
            '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)', boxShadow: '0 6px 18px rgba(96,147,252,0.45)' },
          }}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
}
