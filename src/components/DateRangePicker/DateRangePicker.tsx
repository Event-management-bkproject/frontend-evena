'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Popover, IconButton, Paper } from '@mui/material';
import { CalendarToday, Clear } from '@mui/icons-material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore } from 'date-fns';

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

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFromDateSelect = (date: Date | null) => {
    if (!date) return;

    let newTo = value.to;

    // Nếu chọn from date sau to date, reset to date
    if (newTo && isAfter(date, newTo)) {
      newTo = null;
    }

    onChange({
      from: date,
      to: newTo,
    });

    // Chuyển sang chọn to date
    setCurrentView('to');
  };

  const handleToDateSelect = (date: Date | null) => {
    if (!date) return;

    let newFrom = value.from;

    // Nếu chọn to date trước from date, reset from date
    if (newFrom && isBefore(date, newFrom)) {
      newFrom = null;
    }

    onChange({
      from: newFrom,
      to: date,
    });

    // Đóng popover sau khi chọn xong
    handleClose();
  };

  const handleClear = () => {
    onChange({ from: null, to: null });
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
          onClose={handleClose}
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
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Paper sx={{ p: 2 }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
              {/* From Date Calendar */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="center"
                  color={currentView === 'from' ? 'primary' : 'text.secondary'}
                  mb={1}
                >
                  From Date
                </Typography>
                <DateCalendar
                  value={value.from}
                  onChange={handleFromDateSelect}
                  disablePast={false}
                  shouldDisableDate={(date) => {
                    // Không cho chọn ngày sau to date nếu đã có to date
                    return value.to ? isAfter(date, value.to) : false;
                  }}
                  sx={{
                    '& .MuiPickersDay-root': {
                      borderRadius: '8px',
                      '&.Mui-selected': {
                        backgroundColor: '#f36bf9',
                        '&:hover': {
                          backgroundColor: '#e55ae0',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* To Date Calendar */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="center"
                  color={currentView === 'to' ? 'primary' : 'text.secondary'}
                  mb={1}
                >
                  To Date
                </Typography>
                <DateCalendar
                  value={value.to}
                  onChange={handleToDateSelect}
                  disablePast={false}
                  shouldDisableDate={(date) => {
                    // Không cho chọn ngày trước from date nếu đã có from date
                    return value.from ? isBefore(date, value.from) : false;
                  }}
                  sx={{
                    '& .MuiPickersDay-root': {
                      borderRadius: '8px',
                      '&.Mui-selected': {
                        backgroundColor: '#f36bf9',
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
            {(value.from || value.to) && (
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius="8px" border="1px solid" borderColor="grey.200">
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  Selected Range:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {value.from ? format(value.from, 'EEE, MMM dd, yyyy') : 'Not selected'}
                  {' → '}
                  {value.to ? format(value.to, 'EEE, MMM dd, yyyy') : 'Not selected'}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                Click dates to select range
              </Typography>
              <Box display="flex" gap={1}>
                <IconButton
                  size="small"
                  onClick={handleClear}
                  disabled={!value.from && !value.to}
                  sx={{
                    fontSize: '12px',
                    '&:disabled': { opacity: 0.5 },
                  }}
                >
                  <Clear fontSize="small" />
                  Clear
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
