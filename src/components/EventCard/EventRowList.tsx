// components/EventCard/EventRowList.tsx
'use client';

import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import EventRowCard from './EventRowCard';
import { EventListResponse, EventResponse } from '@/src/stores/types';

interface EventRowListProps {
  events: (EventListResponse | EventResponse)[];
  onEdit?: (event: EventListResponse | EventResponse) => void;
  onDelete?: (event: EventListResponse | EventResponse) => void;
  onClick?: (event: EventListResponse | EventResponse) => void;
  loading?: boolean;
}

const EventRowList: React.FC<EventRowListProps> = ({ events, onEdit, onDelete, onClick, loading = false }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
        textAlign="center"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No events found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first event to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {events.map((event) => (
        <EventRowCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} onClick={onClick} />
      ))}
    </Box>
  );
};

export default EventRowList;
