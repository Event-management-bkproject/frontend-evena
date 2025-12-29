'use client';

import { useEffect } from 'react';
import { useSSE } from '@/src/providers/SSEProvider';
import { useAppDispatch } from '@/src/stores/hooks';
import { EventAPI } from '@/src/stores/services/EventApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';

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
        console.log('[SSESync] 🏢 Invalidating organization cache');
        // Invalidate all organization-related queries
        const orgResult = dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        console.log('[SSESync] 🔄 Invalidation dispatched:', orgResult);
        break;

      // Event events
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_DELETED':
        console.log('[SSESync] 🎉 Invalidating event cache');
        // Invalidate all event-related queries
        const eventResult = dispatch(EventAPI.util.invalidateTags(['Event']));
        console.log('[SSESync] 🔄 Invalidation dispatched:', eventResult);
        break;

      default:
        console.warn('[SSESync] ⚠️ Unknown event type:', type);
    }
  }, [lastEvent, dispatch]);

  return { isConnected, lastEvent };
};
