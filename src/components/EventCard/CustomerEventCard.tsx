'use client';

import React from 'react';
import { Card, CardMedia, Box, Typography, Chip } from '@mui/material';
import { CalendarToday, Place } from '@mui/icons-material';
import { EventListResponse } from '@/src/stores/types';
import { useRouter } from 'next/navigation';
import { formatDate as utilFormatDate, formatTime as utilFormatTime } from '@/src/utils/dateFormatters';

interface CustomerEventCardProps {
  event: EventListResponse;
}

export default function CustomerEventCard({ event }: CustomerEventCardProps) {
  const router = useRouter();

  const getDateInfo = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const handleClick = () => {
    router.push(`/dashboard/customer/events/${event.id}`);
  };

  const dateInfo = getDateInfo(event.startAt);

  return (
    <Card
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.title} event`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
        },
        '&:focus': {
          outline: '2px solid #ED4690',
          outlineOffset: '2px',
        },
      }}
    >
      {/* Event Image */}
      <CardMedia
        component="img"
        image={event.coverUrl || '/images/event-placeholder.jpg'}
        alt={`${event.title} event cover image`}
        sx={{
          height: 200,
          objectFit: 'cover',
        }}
      />

      {/* Content Section: Date (Left) + Info (Right) */}
      <Box sx={{ display: 'flex', p: 2, flex: 1 }}>
        {/* Left: Start Date */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minWidth: 60,
            mr: 2,
            pt: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#F36BF9',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.5px',
            }}
          >
            {dateInfo.month}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: '#F36BF9',
              fontWeight: 700,
              lineHeight: 1,
              mt: 0.5,
            }}
          >
            {dateInfo.day}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: '11px',
              mt: 0.5,
            }}
          >
            {utilFormatTime(event.startAt)}
          </Typography>
        </Box>

        {/* Right: Event Info */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Event Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '16px',
              color: '#2A3363',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </Typography>

          {/* Category Chip */}
          {event.categoryName && (
            <Chip
              label={event.categoryName}
              size="small"
              sx={{
                alignSelf: 'flex-start',
                mb: 1,
                backgroundColor: '#F0F7FF',
                color: '#36437C',
                fontWeight: 600,
                fontSize: '11px',
                height: 'auto',
                py: 0.5,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          )}

          {/* Venue Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#666',
              mt: 'auto',
            }}
          >
            <Place sx={{ fontSize: 14 }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.venueName}, {event.city}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
