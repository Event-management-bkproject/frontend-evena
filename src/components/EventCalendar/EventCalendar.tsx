'use client';

import React, { useState, useMemo } from 'react';
import { Card, Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { CalendarMonth, KeyboardArrowDown, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { EventListResponse } from '@/src/stores/types';
import dayjs from 'dayjs';

interface EventCalendarProps {
  eventDates: string[]; // Array of dates in 'YYYY-MM-DD' format
  events: EventListResponse[]; // Full event data for displaying event list
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function EventCalendar({ eventDates, events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [yearMenuAnchor, setYearMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate array of years (current year ± 5 years)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleYearClick = (event: React.MouseEvent<HTMLElement>) => {
    setYearMenuAnchor(event.currentTarget);
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentMonth, 1));
    setYearMenuAnchor(null);
  };

  const handleCloseYearMenu = () => {
    setYearMenuAnchor(null);
  };

  // Get calendar days for current month with previous and next month days
  // Always display complete weeks (35 or 42 days depending on the month)
  const getCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Get previous month info
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get next month info
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const days: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = [];

    // Add previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Calculate how many days we need to complete the calendar
    // We want complete weeks, so total should be divisible by 7
    const totalDays = days.length;
    const weeksNeeded = Math.ceil(totalDays / 7);
    const totalSlotsNeeded = weeksNeeded * 7;
    const remainingDays = totalSlotsNeeded - totalDays;

    // Add next month days to complete the weeks
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Check if a date has an event
  const hasEvent = (dayObj: { day: number; month: number; year: number }) => {
    const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(
      2,
      '0',
    )}`;
    return eventDates.includes(dateStr);
  };

  // Handle date click
  const handleDateClick = (dayObj: { day: number; month: number; year: number; isCurrentMonth: boolean }) => {
    const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(
      2,
      '0',
    )}`;

    // If clicking a date from previous/next month, navigate to that month
    if (!dayObj.isCurrentMonth) {
      setCurrentDate(new Date(dayObj.year, dayObj.month, 1));
    }

    setSelectedDate(dateStr);
  };

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => {
      const eventDate = dayjs(event.startAt).format('YYYY-MM-DD');
      return eventDate === selectedDate;
    });
  }, [selectedDate, events]);

  const calendarDays = getCalendarDays();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CalendarMonth sx={{ color: '#F36BF9' }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363' }}>
          Event Calendar
        </Typography>
      </Box>

      <Card sx={{ p: 2, borderRadius: '16px' }}>
        {/* Calendar Header - Month, Year and Navigation */}
        <Box sx={{ mb: 2 }}>
          {/* Month, Year with dropdown */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Box
              onClick={handleYearClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#2A3363' }}>
                {MONTHS[currentMonth]}, {currentYear}
              </Typography>
              <KeyboardArrowDown sx={{ fontSize: 18, color: '#2A3363' }} />
            </Box>

            {/* Previous/Next Month Navigation */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={handlePreviousMonth} sx={{ color: '#2A3363', p: 0.5 }}>
                <ChevronLeft fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#2A3363', p: 0.5 }}>
                <ChevronRight fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Year Selection Menu */}
        <Menu
          anchorEl={yearMenuAnchor}
          open={Boolean(yearMenuAnchor)}
          onClose={handleCloseYearMenu}
          PaperProps={{
            sx: {
              maxHeight: 300,
              borderRadius: '12px',
            },
          }}
        >
          {years.map((year) => (
            <MenuItem
              key={year}
              onClick={() => handleYearSelect(year)}
              selected={year === currentYear}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(243, 107, 249, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(243, 107, 249, 0.2)',
                  },
                },
              }}
            >
              {year}
            </MenuItem>
          ))}
        </Menu>

        {/* Days of Week Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            mb: 0.5,
          }}
        >
          {DAYS_OF_WEEK.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                py: 0.5,
              }}
            >
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>{day}</Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Days Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
          }}
        >
          {calendarDays.map((dayObj, index) => {
            const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(
              2,
              '0',
            )}`;
            const isSelected = selectedDate === dateStr;
            const hasEventDate = hasEvent(dayObj);

            return (
              <Box
                key={index}
                onClick={() => handleDateClick(dayObj)}
                sx={{
                  textAlign: 'center',
                  py: 0.5,
                  position: 'relative',
                  minHeight: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(243, 107, 249, 0.1)',
                    borderRadius: '4px',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? (hasEventDate ? '#F26CF9' : '#37437D') : 'transparent',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: isSelected ? '#FFFFFF' : dayObj.isCurrentMonth ? '#000000' : '#ADACAE',
                      fontWeight: 400,
                    }}
                  >
                    {dayObj.day}
                  </Typography>
                </Box>
                {!isSelected && hasEventDate && (
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: '#F26CF9',
                      position: 'absolute',
                      bottom: 4,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Event List for Selected Date */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2A3363', mb: 1 }}>
              Events on {dayjs(selectedDate).format('MMM D, YYYY')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedDateEvents.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    backgroundColor: '#EEF0FF',
                    borderRadius: '8px',
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#dce0f5',
                    },
                  }}
                >
                  {/* Date Block */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F36BF9',
                      borderRadius: '5px',
                      px: 1,
                      py: 1,
                      minWidth: 40,
                    }}
                  >
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                      {dayjs(event.startAt).format('DD')}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: '#FFFFFF', lineHeight: 1.2 }}>
                      {dayjs(event.startAt).format('ddd')}
                    </Typography>
                  </Box>

                  {/* Event Info Block */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: '#000000',
                        fontWeight: 500,
                        lineHeight: 1.2,
                        mb: 0.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '10px', color: '#ADACAE' }}>{event.categoryName}</Typography>
                      <Typography sx={{ fontSize: '10px', color: '#ADACAE' }}>•</Typography>
                      <Typography sx={{ fontSize: '10px', color: '#ADACAE' }}>
                        {dayjs(event.startAt).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
