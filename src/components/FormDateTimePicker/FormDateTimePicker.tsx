'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Popover, Button, Divider, Fade, IconButton } from '@mui/material';
import { CalendarToday, Clear, Check, Close, AccessTime } from '@mui/icons-material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useField, useFormikContext } from 'formik';
import { format, parse, isValid } from 'date-fns';

interface FormDateTimePickerProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const FormDateTimePicker = ({
  name,
  label,
  required = false,
  disabled = false,
  fullWidth = true,
}: FormDateTimePickerProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  // Parse ISO string to Date, or null
  const parseValue = (val: string | null | undefined): Date | null => {
    if (!val) return null;
    const date = new Date(val);
    return isValid(date) ? date : null;
  };

  // Temp state for popover editing
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempHour, setTempHour] = useState(0);
  const [tempMinute, setTempMinute] = useState(0);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const current = parseValue(field.value);
    if (current) {
      setTempDate(current);
      setTempHour(current.getHours());
      setTempMinute(current.getMinutes());
    } else {
      setTempDate(new Date());
      setTempHour(12);
      setTempMinute(0);
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setFieldTouched(name, true);
  };

  const handleApply = () => {
    if (tempDate) {
      const result = new Date(tempDate);
      result.setHours(tempHour, tempMinute, 0, 0);
      // Format as ISO-like string for datetime-local compatibility: "YYYY-MM-DDTHH:mm"
      const isoStr = format(result, "yyyy-MM-dd'T'HH:mm");
      setFieldValue(name, isoStr);
    }
    setAnchorEl(null);
    setFieldTouched(name, true);
  };

  const handleClear = () => {
    setFieldValue(name, '');
    setAnchorEl(null);
    setFieldTouched(name, true);
  };

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setTempDate(date);
    }
  };

  // Format display value
  const displayValue = (() => {
    const date = parseValue(field.value);
    if (!date) return '';
    return format(date, 'MMM dd, yyyy  •  HH:mm');
  })();

  const open = Boolean(anchorEl);
  const hasError = meta.touched && Boolean(meta.error);

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
            value={displayValue}
            placeholder="Select date and time"
            required={required}
            disabled={disabled}
            fullWidth={fullWidth}
            error={hasError}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {field.value && (
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
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                '&:hover fieldset': {
                  borderColor: disabled ? 'rgba(0, 0, 0, 0.23)' : '#f36bf9',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f36bf9',
                },
                '& .MuiInputBase-input': {
                  color: '#37437d',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                },
              },
            }}
          />
        </Box>

        {/* Validation Error */}
        {hasError && (
          <Typography
            variant="caption"
            sx={{ color: '#d32f2f', mt: 0.5, display: 'block', ml: 1.5 }}
          >
            {meta.error}
          </Typography>
        )}

        {/* Calendar Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
          <Box sx={{ p: 2, minWidth: 320 }}>
            {/* Calendar */}
            <DateCalendar
              value={tempDate}
              onChange={handleDateSelect}
              sx={{
                width: '100%',
                mb: -2,
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
                  '&:hover': {
                    backgroundColor: 'rgba(243, 107, 249, 0.1)',
                  },
                },
                '& .MuiPickersCalendarHeader-label': {
                  fontWeight: 600,
                  color: '#2A3363',
                },
                '& .MuiPickersArrowSwitcher-button': {
                  color: '#2A3363',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  fontWeight: 600,
                  color: '#666',
                },
                '& .MuiPickersYear-yearButton.Mui-selected': {
                  backgroundColor: '#f36bf9',
                  '&:hover': { backgroundColor: '#e55ae0' },
                },
              }}
            />

            <Divider sx={{ my: 1 }} />

            {/* Time Selection */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                py: 1.5,
              }}
            >
              <AccessTime sx={{ color: '#f36bf9', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 600, color: '#2A3363', fontSize: 14 }}>
                Time:
              </Typography>
              <TextField
                type="number"
                value={tempHour}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 0;
                  if (val < 0) val = 0;
                  if (val > 23) val = 23;
                  setTempHour(val);
                }}
                inputProps={{ min: 0, max: 23 }}
                sx={{
                  width: 65,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#2A3363',
                      py: 1,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f36bf9',
                    },
                  },
                }}
              />
              <Typography sx={{ fontWeight: 700, color: '#2A3363', fontSize: 18 }}>:</Typography>
              <TextField
                type="number"
                value={tempMinute.toString().padStart(2, '0')}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 0;
                  if (val < 0) val = 0;
                  if (val > 59) val = 59;
                  setTempMinute(val);
                }}
                inputProps={{ min: 0, max: 59 }}
                sx={{
                  width: 65,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#2A3363',
                      py: 1,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f36bf9',
                    },
                  },
                }}
              />
            </Box>

            {/* Selected Preview */}
            {tempDate && (
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: 'rgba(243, 107, 249, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(243, 107, 249, 0.2)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" fontWeight={600} color="#2A3363">
                  {(() => {
                    const preview = new Date(tempDate);
                    preview.setHours(tempHour, tempMinute, 0, 0);
                    return format(preview, 'EEEE, MMM dd, yyyy  •  HH:mm');
                  })()}
                </Typography>
              </Box>
            )}

            {/* Actions */}
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={handleClear}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                }}
              >
                Clear
              </Button>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Close />}
                  onClick={handleClose}
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Check />}
                  onClick={handleApply}
                  disabled={!tempDate}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#f36bf9',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#e55ae0' },
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default FormDateTimePicker;
