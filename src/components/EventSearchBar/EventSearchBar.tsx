'use client';

import React, { useState } from 'react';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Place, CalendarToday } from '@mui/icons-material';

interface EventSearchBarProps {
  onSearch: (keyword: string, place: string, date: string) => void;
}

export default function EventSearchBar({ onSearch }: EventSearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => {
    onSearch(keyword, place, date);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        backgroundColor: 'white',
        p: 2,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Search by Event Name/Keyword */}
      <TextField
        placeholder="Search events..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          flex: '1 1 300px',
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            borderRadius: '30px',
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
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#999' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Search by Place */}
      <TextField
        placeholder="Location"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          flex: '1 1 200px',
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            borderRadius: '30px',
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
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Place sx={{ color: '#999' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Search by Date */}
      <TextField
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          flex: '1 1 180px',
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            borderRadius: '30px',
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
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarToday sx={{ color: '#999', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Search Button */}
      <IconButton
        onClick={handleSearch}
        sx={{
          backgroundColor: '#F36BF9',
          color: 'white',
          width: 48,
          height: 48,
          '&:hover': {
            backgroundColor: '#e55ae0',
          },
        }}
      >
        <Search />
      </IconButton>
    </Box>
  );
}
