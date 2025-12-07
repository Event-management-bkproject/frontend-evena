'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Popover, IconButton, Paper, Button, Chip, Divider, Fade } from '@mui/material';
import { CalendarToday, Clear, Check, Close } from '@mui/icons-material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval } from 'date-fns';

interface DateRangePickerProps {
  value: {
    from: Date | null;
    to: Date | null;
  };
  onChange: (range: { from: Date | null; to: Date | null }) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

type PresetType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth';

const DateRangePicker = ({
  value,
  onChange,
  label = 'Date Range',
  required = false,
  disabled = false,
  fullWidth = true,
}: DateRangePickerProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [currentView, setCurrentView] = useState<'from' | 'to'>('from');
  const [tempValue, setTempValue] = useState<{ from: Date | null; to: Date | null }>(value);
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setTempValue(value);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setTempValue(value);
  };

  const handleApply = () => {
    onChange(tempValue);
    setAnchorEl(null);
  };

  const handleCancel = () => {
    setTempValue(value);
    setAnchorEl(null);
  };

  const getPresetRange = (preset: PresetType): { from: Date; to: Date } => {
    const today = startOfToday();

    switch (preset) {
      case 'today':
        return { from: today, to: endOfToday() };
      case 'yesterday':
        return { from: subDays(today, 1), to: subDays(today, 1) };
      case 'last7days':
        return { from: subDays(today, 6), to: today };
      case 'last30days':
        return { from: subDays(today, 29), to: today };
      case 'thisWeek':
        return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) };
      case 'lastWeek':
        const lastWeek = subDays(today, 7);
        return { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
      case 'thisMonth':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      default:
        return { from: today, to: today };
    }
  };

  const handlePresetClick = (preset: PresetType) => {
    const range = getPresetRange(preset);
    setTempValue(range);
    setSelectedPreset(preset);
  };

  const handleFromDateSelect = (date: Date | null) => {
    if (!date) return;

    let newTo = tempValue.to;

    // Nếu chọn from date sau to date, reset to date
    if (newTo && isAfter(date, newTo)) {
      newTo = null;
    }

    setTempValue({
      from: date,
      to: newTo,
    });

    setSelectedPreset(null);
    // Chuyển sang chọn to date
    setCurrentView('to');
  };

  const handleToDateSelect = (date: Date | null) => {
    if (!date) return;

    let newFrom = tempValue.from;

    // Nếu chọn to date trước from date, reset from date
    if (newFrom && isBefore(date, newFrom)) {
      newFrom = null;
    }

    setTempValue({
      from: newFrom,
      to: date,
    });

    setSelectedPreset(null);
  };

  const handleClear = () => {
    setTempValue({ from: null, to: null });
    setSelectedPreset(null);
  };

  const isDateInRange = (date: Date): boolean => {
    if (!tempValue.from || !tempValue.to) return false;
    try {
      return isWithinInterval(date, { start: tempValue.from, end: tempValue.to });
    } catch {
      return false;
    }
  };

  const formatDateRange = () => {
    if (!value.from && !value.to) return '';
    if (value.from && value.to) {
      return `${format(value.from, 'dd/MM/yyyy')} - ${format(value.to, 'dd/MM/yyyy')}`;
    }
    if (value.from) return `From: ${format(value.from, 'dd/MM/yyyy')}`;
    if (value.to) return `To: ${format(value.to, 'dd/MM/yyyy')}`;
    return '';
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        {/* Label */}
        <Typography
          variant="body1"
          component="label"
          sx={{
            display: 'block',
            fontWeight: '540',
            color: '#37437D',
            fontSize: '16px',
            marginBottom: '8px',
          }}
        >
          {label}
          {required && ' *'}
        </Typography>

        {/* Input Field */}
        <Box
          sx={{
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onClick={handleOpen}
        >
          <TextField
            value={formatDateRange()}
            placeholder="Select date range"
            required={required}
            disabled={disabled}
            fullWidth={fullWidth}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {value.from && value.to && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      sx={{
                        padding: '4px',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  )}
                  <CalendarToday
                    sx={{
                      color: disabled ? 'action.disabled' : 'action.active',
                      fontSize: '20px',
                    }}
                  />
                </Box>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                backgroundColor: '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',

                '&:hover fieldset': {
                  borderColor: disabled ? 'rgba(0, 0, 0, 0.23)' : '#1976d2',
                },

                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },

                '&.Mui-disabled': {
                  backgroundColor: '#ffffff',
                  opacity: 0.7,
                },

                '& .MuiInputBase-input': {
                  color: '#37437d',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                },
              },
            }}
          />
        </Box>

        {/* Calendar Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleCancel}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              mt: 1,
            },
          }}
          TransitionComponent={Fade}
        >
          <Paper sx={{ minWidth: { xs: 320, md: 800 } }}>
            <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }}>
              {/* Quick Presets Sidebar */}
              <Box
                sx={{
                  p: 2,
                  borderRight: { lg: '1px solid' },
                  borderBottom: { xs: '1px solid', lg: 'none' },
                  borderColor: 'divider',
                  minWidth: { lg: 180 },
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1.5}>
                  Quick Select
                </Typography>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  {[
                    { label: 'Today', value: 'today' as PresetType },
                    { label: 'Yesterday', value: 'yesterday' as PresetType },
                    { label: 'Last 7 days', value: 'last7days' as PresetType },
                    { label: 'Last 30 days', value: 'last30days' as PresetType },
                    { label: 'This Week', value: 'thisWeek' as PresetType },
                    { label: 'Last Week', value: 'lastWeek' as PresetType },
                    { label: 'This Month', value: 'thisMonth' as PresetType },
                    { label: 'Last Month', value: 'lastMonth' as PresetType },
                  ].map((preset) => (
                    <Button
                      key={preset.value}
                      variant={selectedPreset === preset.value ? 'contained' : 'text'}
                      size="small"
                      onClick={() => handlePresetClick(preset.value)}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: selectedPreset === preset.value ? 600 : 400,
                        backgroundColor: selectedPreset === preset.value ? '#f36bf9' : 'transparent',
                        color: selectedPreset === preset.value ? 'white' : 'text.primary',
                        '&:hover': {
                          backgroundColor: selectedPreset === preset.value ? '#e55ae0' : 'rgba(243, 107, 249, 0.08)',
                        },
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Calendars Section */}
              <Box flex={1} p={2}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                  {/* From Date Calendar */}
                  <Box flex={1}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      textAlign="center"
                      color={currentView === 'from' ? '#f36bf9' : 'text.secondary'}
                      mb={1}
                    >
                      From Date
                    </Typography>
                    <DateCalendar
                      value={tempValue.from}
                      onChange={handleFromDateSelect}
                      disablePast={false}
                      shouldDisableDate={(date) => {
                        return tempValue.to ? isAfter(date, tempValue.to) : false;
                      }}
                      sx={{
                        '& .MuiPickersDay-root': {
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          '&.Mui-selected': {
                            backgroundColor: '#f36bf9',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#e55ae0',
                            },
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* To Date Calendar */}
                  <Box flex={1}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      textAlign="center"
                      color={currentView === 'to' ? '#f36bf9' : 'text.secondary'}
                      mb={1}
                    >
                      To Date
                    </Typography>
                    <DateCalendar
                      value={tempValue.to}
                      onChange={handleToDateSelect}
                      disablePast={false}
                      shouldDisableDate={(date) => {
                        return tempValue.from ? isBefore(date, tempValue.from) : false;
                      }}
                      sx={{
                        '& .MuiPickersDay-root': {
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          '&.Mui-selected': {
                            backgroundColor: '#f36bf9',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#e55ae0',
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Selected Range Display */}
                {(tempValue.from || tempValue.to) && (
                  <Box mt={2} p={2} bgcolor="rgba(243, 107, 249, 0.08)" borderRadius="12px" border="1px solid" borderColor="rgba(243, 107, 249, 0.2)">
                    <Typography variant="caption" fontWeight="600" color="#f36bf9" display="block" mb={0.5}>
                      Selected Range:
                    </Typography>
                    <Typography variant="body2" fontWeight="500" color="text.primary">
                      {tempValue.from ? format(tempValue.from, 'EEE, MMM dd, yyyy') : 'Not selected'}
                      {' → '}
                      {tempValue.to ? format(tempValue.to, 'EEE, MMM dd, yyyy') : 'Not selected'}
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button
                    size="small"
                    startIcon={<Clear />}
                    onClick={handleClear}
                    disabled={!tempValue.from && !tempValue.to}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    Clear
                  </Button>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Close />}
                      onClick={handleCancel}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Check />}
                      onClick={handleApply}
                      disabled={!tempValue.from || !tempValue.to}
                      sx={{
                        textTransform: 'none',
                        backgroundColor: '#f36bf9',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: '#e55ae0',
                        },
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
