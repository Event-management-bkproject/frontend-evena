// components/EventGrid/EventGrid.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { EventListResponse, EventResponse } from '@/src/stores/types';
import EventCard from '../EventCard/EventCard';

interface EventGridProps {
  events: EventListResponse[] | EventResponse[];
  onEdit?: (event: EventListResponse | EventResponse) => void;
  onDelete?: (event: EventListResponse | EventResponse) => void;
  onCardClick?: (event: EventListResponse | EventResponse) => void;
  loading?: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'compact';
}

const EventGrid: React.FC<EventGridProps> = ({
  events,
  onEdit,
  onDelete,
  onCardClick,
  loading = false,
  emptyMessage = 'No events found',
  variant = 'default',
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {[...Array(6)].map((_, index) => (
          <Box
            key={index}
            sx={{
              height: variant === 'compact' ? 140 : 200,
              bgcolor: 'grey.100',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {events.map((event) => (
        <Box key={event.id}>
          <EventCard event={event} onEdit={onEdit} onDelete={onDelete} onClick={onCardClick} variant={variant} />
        </Box>
      ))}
    </Box>
  );
};

export default EventGrid;
