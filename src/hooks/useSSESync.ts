'use client';

import { useEffect } from 'react';
import { useSSE } from '@/src/providers/SSEProvider';
import { useAppDispatch } from '@/src/stores/hooks';
import { EventAPI } from '@/src/stores/services/EventApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

/**
 * Hook to sync SSE events with RTK Query cache
 * Invalidates cache when events are received to trigger automatic refetch
 */
export const useSSESync = () => {
  const { isConnected, lastEvent } = useSSE();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastEvent) return;

    const { type, data } = lastEvent;

    console.log('[SSESync] 🔄 Processing event:', type, data);

    switch (type) {
      // Organization events
      case 'ORGANIZATION_CREATED':
      case 'ORGANIZATION_UPDATED':
      case 'ORGANIZATION_DELETED':
      case 'ORGANIZATION_VERIFIED':
        console.log('[SSESync] 🏢 Invalidating organization cache');
        // Invalidate all organization-related queries
        const orgResult = dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        console.log('[SSESync] 🔄 Invalidation dispatched:', orgResult);
        break;

      // Event events
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_DELETED':
      case 'EVENT_PUBLISHED':
        console.log('[SSESync] 🎉 Invalidating event cache');
        // Invalidate all event-related queries
        const eventResult = dispatch(EventAPI.util.invalidateTags(['Event']));
        console.log('[SSESync] 🔄 Invalidation dispatched:', eventResult);
        break;

      // Category events
      case 'CATEGORY_CREATED':
      case 'CATEGORY_UPDATED':
      case 'CATEGORY_DELETED':
        console.log('[SSESync] 📁 Invalidating category cache');
        // Invalidate all category-related queries
        dispatch(CategoryAPI.util.invalidateTags(['Category']));
        break;

      // Venue events
      case 'VENUE_CREATED':
      case 'VENUE_UPDATED':
      case 'VENUE_DELETED':
        console.log('[SSESync] 📍 Invalidating venue cache');
        // Invalidate all venue-related queries
        dispatch(VenueAPI.util.invalidateTags(['Venue']));
        break;

      default:
        console.warn('[SSESync] ⚠️ Unknown event type:', type);
    }
  }, [lastEvent, dispatch]);

  return { isConnected, lastEvent };
};
