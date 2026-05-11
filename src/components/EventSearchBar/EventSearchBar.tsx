'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Divider } from '@mui/material';
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
    '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
    '& .MuiInputBase-input': { fontSize: 14, color: '#0F172A' },
    '& .MuiInputBase-input::placeholder': { color: '#94A3B8' },
  };

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        border: '1px solid #F1F5F9',
        overflow: 'hidden',
        p: { xs: 1.5, sm: 0.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 0, sm: 0 },
      }}
    >
      {/* Keyword — full width on mobile */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 2, px: { xs: 0.5, sm: 1 }, py: { xs: 0.5, sm: 0 } }}>
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

      <Divider sx={{ borderColor: '#F1F5F9', display: { xs: 'block', sm: 'none' } }} />
      <Divider orientation="vertical" flexItem sx={{ borderColor: '#F1F5F9', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

      {/* Location + Date — side by side on all sizes */}
      <Box sx={{ display: 'flex', flex: 2.7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: { xs: 0.5, sm: 1 }, py: { xs: 0.5, sm: 0 } }}>
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

        <Divider orientation="vertical" flexItem sx={{ borderColor: '#F1F5F9', my: { xs: 0.5, sm: 0.5 } }} />

        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: { xs: 0.5, sm: 1 }, py: { xs: 0.5, sm: 0 } }}>
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
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9', display: { xs: 'block', sm: 'none' } }} />

      {/* Search button — full width on mobile */}
      <Box sx={{ flexShrink: 0, px: { xs: 0, sm: 1 }, pt: { xs: 1, sm: 0.5 }, pb: { xs: 0, sm: 0.5 } }}>
        <Button
          onClick={handleSearch}
          variant="contained"
          startIcon={<Search />}
          fullWidth
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
            minWidth: { sm: 110 },
            '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)', boxShadow: '0 6px 18px rgba(96,147,252,0.45)' },
          }}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
}
