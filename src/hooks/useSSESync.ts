'use client';

import { useEffect } from 'react';
import { useSSE } from '@/src/providers/SSEProvider';
import { useAppDispatch } from '@/src/stores/hooks';
import { EventAPI } from '@/src/stores/services/EventApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';
import { OrganizationMemberAPI } from '@/src/stores/services/OrganizationMemberApi';
import { SSENormalizedType } from '@/src/stores/types/sse';

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
      case SSENormalizedType.ORGANIZATION_CREATED:
      case SSENormalizedType.ORGANIZATION_UPDATED:
      case SSENormalizedType.ORGANIZATION_DELETED:
      case SSENormalizedType.ORGANIZATION_VERIFIED:
      case SSENormalizedType.ORGANIZATION_UNVERIFIED: {
        console.log('[SSESync] 🏢 Invalidating organization cache');
        const orgResult = dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        console.log('[SSESync] 🔄 Invalidation dispatched:', orgResult);
        break;
      }

      // Event events
      case SSENormalizedType.EVENT_CREATED:
      case SSENormalizedType.EVENT_UPDATED:
      case SSENormalizedType.EVENT_DELETED:
      case SSENormalizedType.EVENT_PUBLISHED: {
        console.log('[SSESync] 🎉 Invalidating event cache');
        const eventResult = dispatch(EventAPI.util.invalidateTags(['Event']));
        console.log('[SSESync] 🔄 Invalidation dispatched:', eventResult);
        break;
      }

      // Category events
      case SSENormalizedType.CATEGORY_CREATED:
      case SSENormalizedType.CATEGORY_UPDATED:
      case SSENormalizedType.CATEGORY_DELETED:
        console.log('[SSESync] 📁 Invalidating category cache');
        dispatch(CategoryAPI.util.invalidateTags(['Category']));
        break;

      // Venue events
      case SSENormalizedType.VENUE_CREATED:
      case SSENormalizedType.VENUE_UPDATED:
      case SSENormalizedType.VENUE_DELETED:
        console.log('[SSESync] 📍 Invalidating venue cache');
        dispatch(VenueAPI.util.invalidateTags(['Venue']));
        break;

      // Invitation events
      case SSENormalizedType.INVITATION_CREATED:
      case SSENormalizedType.INVITATION_ACCEPTED:
      case SSENormalizedType.INVITATION_REJECTED:
        console.log('[SSESync] ✉️ Invalidating invitation/member cache');
        dispatch(OrganizationMemberAPI.util.invalidateTags(['Invitation', 'OrganizationMember']));
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      default:
        // Don't warn for unknown events - they may be handled elsewhere
        break;
    }
  }, [lastEvent, dispatch]);

  return { isConnected, lastEvent };
};
