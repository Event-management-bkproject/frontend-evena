// components/EventCard/EventRowList.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import EventRowCard from './EventRowCard';
import { EventListResponse, EventResponse } from '@/src/stores/types';

interface EventRowListProps {
  events: (EventListResponse | EventResponse)[];
  onEdit?: (event: EventListResponse | EventResponse) => void;
  onDelete?: (event: EventListResponse | EventResponse) => void;
  onClick?: (event: EventListResponse | EventResponse) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ITEMS_PER_PAGE = 20;

const EventRowList: React.FC<EventRowListProps> = ({
  events,
  onEdit,
  onDelete,
  onClick,
  loading = false,
  onLoadMore,
  hasMore = false
}) => {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll with Intersection Observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && displayCount < events.length) {
      // Load more items from current list
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, events.length));
    } else if (target.isIntersecting && hasMore && onLoadMore && !loading) {
      // Load more from API
      onLoadMore();
    }
  }, [displayCount, events.length, hasMore, onLoadMore, loading]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px', // Trigger 200px before reaching bottom
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  // Ensure all loaded events are visible when a new event is added (e.g. after SSE refetch)
  useEffect(() => {
    if (events.length < displayCount) {
      setDisplayCount(Math.min(ITEMS_PER_PAGE, events.length));
    } else if (events.length > displayCount) {
      // Extend display to cover all currently-loaded events so data-id attrs are in DOM
      setDisplayCount(events.length);
    }
  }, [events.length]);

  if (loading && events.length === 0) {
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

  const visibleEvents = events.slice(0, displayCount);

  return (
    <Box>
      {visibleEvents.map((event) => (
        <EventRowCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} onClick={onClick} />
      ))}

      {/* Intersection Observer target */}
      <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />

      {/* Loading indicator at bottom */}
      {(loading || displayCount < events.length) && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={32} />
        </Box>
      )}
    </Box>
  );
};

export default EventRowList;
