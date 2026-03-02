'use client';

import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Button, InputAdornment, Typography, Chip, SelectChangeEvent } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);

  // Calculate event counts by status
  const statusCounts = useMemo(() => {
    const counts = {
      [EventStatus.DRAFT]: 0,
      [EventStatus.PUBLISHED]: 0,
      [EventStatus.ONGOING]: 0,
      [EventStatus.COMPLETED]: 0,
      [EventStatus.CANCELLED]: 0,
    };

    events.forEach((event) => {
      if (event.status in counts) {
        counts[event.status]++;
      }
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
    onCategoryChange(value === '' ? null : (value as number));
  };

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as 'week' | 'month' | 'year' | 'all';
    setTimeRange(value);
    onTimeRangeChange(value);
  };

  // Status chip styling - all chips use #F36BF9
  const statusColor = '#F36BF9';

  const getStatusLabel = (status: EventStatus): string => {
    switch (status) {
      case EventStatus.DRAFT:
        return 'Draft';
      case EventStatus.PUBLISHED:
        return 'Published';
      case EventStatus.ONGOING:
        return 'Ongoing';
      case EventStatus.COMPLETED:
        return 'Completed';
      case EventStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleStatusClick = (status: EventStatus) => {
    if (selectedStatus === status) {
      // If clicking the same status, deselect it
      setSelectedStatus(null);
      onStatusChange(null);
    } else {
      // Select the new status
      setSelectedStatus(status);
      onStatusChange(status);
    }
  };

  return (
    <Box>
      {/* Search and Filter Row */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          mb: 2,
          backgroundColor: 'transparent',
          borderRadius: 2,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={disabled || loading}
          sx={{
            flex: '1 1 300px',
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              backgroundColor: 'white',
              color: '#36437C',
              '& fieldset': {
                borderColor: '#E0E0E0',
              },
              '&:hover fieldset': {
                borderColor: '#36437C',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#36437C',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#ADACAE',
              opacity: 1,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Box component="i" className="fa-solid fa-magnifying-glass" sx={{ color: '#575658', fontSize: '14px' }} />
              </InputAdornment>
            ),
          }}
        />

      {/* Category Filter */}
      <FormControl
        size="small"
        sx={{
          flex: '0 1 200px',
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            backgroundColor: '#EEF0FF',
            color: '#36437C',
            '& fieldset': {
              borderColor: '#EEF0FF',
            },
            '&:hover fieldset': {
              borderColor: '#36437C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#36437C',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#36437C',
            '&.Mui-focused': {
              color: '#36437C',
            },
          },
        }}
      >
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={handleCategoryChange} label="Category" disabled={disabled || loading}>
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Time Range Filter */}
      <FormControl
        size="small"
        sx={{
          flex: '0 1 200px',
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            backgroundColor: '#EEF0FF',
            color: '#36437C',
            '& fieldset': {
              borderColor: '#EEF0FF',
            },
            '&:hover fieldset': {
              borderColor: '#36437C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#36437C',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#36437C',
            '&.Mui-focused': {
              color: '#36437C',
            },
          },
        }}
      >
        <Select value={timeRange} onChange={handleTimeRangeChange} disabled={disabled || loading} displayEmpty>
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
          <MenuItem value="year">This Year</MenuItem>
        </Select>
      </FormControl>

      {/* Create Button */}
      <Button
        variant="contained"
        startIcon={<Add sx={{ width: '10px', height: '10px' }} />}
        onClick={onCreateClick}
        disabled={disabled || loading}
        sx={{
          flex: '0 0 auto',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '25px',
          backgroundColor: '#F36BF9',
          color: 'white',
          '&:hover': {
            backgroundColor: '#e55ae0',
          },
          '&:disabled': {
            backgroundColor: '#cccccc',
            color: '#666666',
          },
        }}
      >
        Create Event
      </Button>
      </Box>

      {/* Status Count Row */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', mr: 1 }}>
          Events by Status:
        </Typography>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Chip
            key={status}
            label={`${getStatusLabel(status as EventStatus)} (${count})`}
            onClick={() => handleStatusClick(status as EventStatus)}
            sx={{
              backgroundColor: selectedStatus === status ? statusColor : 'transparent',
              color: selectedStatus === status ? '#FFFFFF' : statusColor,
              fontWeight: 600,
              fontSize: '14px',
              border: `2px solid ${statusColor}`,
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: 'auto',
              px: 2,
              py: 0.75,
              '& .MuiChip-label': {
                padding: 0,
              },
              '&:hover': {
                backgroundColor: statusColor,
                color: '#FFFFFF',
                transform: 'scale(1.05)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default EventFilters;
