'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../stores/hooks';
import { EventAPI } from '../stores/services/EventApi';
import { OrganizerAPI } from '../stores/services/OrganizerApi';
import { CategoryAPI } from '../stores/services/CategoryApi';
import { VenueAPI } from '../stores/services/VenueApi';
import { OrganizationMemberAPI } from '../stores/services/OrganizationMemberApi';

interface SSEContextType {
  isConnected: boolean;
  lastEvent: SSEEvent | null;
}

interface SSEEvent {
  type: string;
  data: any;
  timestamp: string;
}

const SSEContext = createContext<SSEContextType>({
  isConnected: false,
  lastEvent: null,
});

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within SSEProvider');
  }
  return context;
};

interface SSEProviderProps {
  children: React.ReactNode;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  // Get auth state from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken);
  const userId = user?.id;
  const isAdmin = user?.roles?.includes('ADMIN') || false;
  const isOrganizer = user?.roles?.includes('ORGANIZER') || false;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Disconnect if user logged out
    if (!userId || !token) {
      console.log('[SSE] 🔌 Disconnecting: User logged out');
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
      setIsConnected(false);
      return;
    }

    // Determine which channels to subscribe to
    const channels: string[] = ['public']; // All users subscribe to public

    // Add organizer channel if user has ORGANIZER role
    if (isOrganizer) {
      channels.push('organizer');
    }

    // Add admin channel
    if (isAdmin) {
      channels.push('admin');
    }

    console.log('[SSE] 📡 Subscribing to channels:', channels);

    // Clean up old connections not in new channels list
    eventSourcesRef.current.forEach((es, channel) => {
      if (!channels.includes(channel)) {
        console.log('[SSE] 🔌 Closing connection to:', channel);
        es.close();
        eventSourcesRef.current.delete(channel);
      }
    });

    const setupEventSource = (channel: string) => {
      // Skip if already connected to this channel
      if (eventSourcesRef.current.has(channel)) {
        return;
      }

      const sseUrl = `${process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:8000'}/sse/stream/${channel}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('connected', (e) => {
        console.log(`[SSE] ✅ Connected to ${channel}:`, e.data);
        setIsConnected(true);

        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      // Define event handler
      const handleEvent = (eventType: string, normalizedType: string) => (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data);
        console.log(`[SSE][${channel}] ${eventType}:`, parsedData);
        setLastEvent({
          type: normalizedType,
          data: parsedData.data || parsedData,
          timestamp: new Date().toISOString(),
        });
      };

      // Organization events
      eventSource.addEventListener('organization:create', handleEvent('🏢 Organization created', 'ORGANIZATION_CREATED'));
      eventSource.addEventListener('organization:update', handleEvent('🏢 Organization updated', 'ORGANIZATION_UPDATED'));
      eventSource.addEventListener('organization:delete', handleEvent('🏢 Organization deleted', 'ORGANIZATION_DELETED'));
      eventSource.addEventListener('organization:verify', handleEvent('🏢 Organization verified', 'ORGANIZATION_VERIFIED'));
      eventSource.addEventListener('organization:unverify', handleEvent('🏢 Organization needs re-verification', 'ORGANIZATION_UNVERIFIED'));

      // Invitation events
      eventSource.addEventListener('invitation:create', handleEvent('✉️ Invitation sent', 'INVITATION_CREATED'));
      eventSource.addEventListener('invitation:accept', handleEvent('✅ Invitation accepted', 'INVITATION_ACCEPTED'));
      eventSource.addEventListener('invitation:reject', handleEvent('❌ Invitation rejected', 'INVITATION_REJECTED'));

      // Event events
      eventSource.addEventListener('event:create', handleEvent('🎉 Event created', 'EVENT_CREATED'));
      eventSource.addEventListener('event:update', handleEvent('🎉 Event updated', 'EVENT_UPDATED'));
      eventSource.addEventListener('event:delete', handleEvent('🎉 Event deleted', 'EVENT_DELETED'));
      eventSource.addEventListener('event:publish', handleEvent('🎉 Event published', 'EVENT_PUBLISHED'));

      // Category events
      eventSource.addEventListener('category:create', handleEvent('📁 Category created', 'CATEGORY_CREATED'));
      eventSource.addEventListener('category:update', handleEvent('📁 Category updated', 'CATEGORY_UPDATED'));
      eventSource.addEventListener('category:delete', handleEvent('📁 Category deleted', 'CATEGORY_DELETED'));

      // Venue events
      eventSource.addEventListener('venue:create', handleEvent('📍 Venue created', 'VENUE_CREATED'));
      eventSource.addEventListener('venue:update', handleEvent('📍 Venue updated', 'VENUE_UPDATED'));
      eventSource.addEventListener('venue:delete', handleEvent('📍 Venue deleted', 'VENUE_DELETED'));

      // Heartbeat event
      eventSource.addEventListener('heartbeat', () => {
        console.log(`[SSE][${channel}] 💓 Heartbeat`);
      });

      eventSource.onerror = (error) => {
        if (error){
          console.error(`[SSE][${channel}] ❌ Error:`, error);
        }
        eventSourcesRef.current.delete(channel);

        // Reconnect after 3 seconds
        if (eventSourcesRef.current.size === 0) {
          setIsConnected(false);

          // Clear any existing reconnect timeout to prevent memory leak
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[SSE] 🔄 Reconnecting to ${channel}...`);
            setupEventSource(channel);
            reconnectTimeoutRef.current = null;
          }, 3000);
        }
      };

      eventSourcesRef.current.set(channel, eventSource);
    };

    // Setup all channels
    channels.forEach(setupEventSource);

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[SSE] 🔌 Cleaning up SSE connections');
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId, isOrganizer, isAdmin]); // Reconnect when user, role, or admin status changes

  // Global SSE cache invalidation - handles all RTK Query cache updates
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastEvent) return;

    const { type } = lastEvent;
    console.log('[SSE] 🔄 Cache invalidation for event:', type);

    switch (type) {
      // Organization events
      case 'ORGANIZATION_CREATED':
      case 'ORGANIZATION_UPDATED':
      case 'ORGANIZATION_DELETED':
      case 'ORGANIZATION_VERIFIED':
      case 'ORGANIZATION_UNVERIFIED':
        console.log('[SSE] 🏢 Invalidating organization cache');
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      // Event events
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_DELETED':
      case 'EVENT_PUBLISHED':
        console.log('[SSE] 🎉 Invalidating event cache');
        dispatch(EventAPI.util.invalidateTags(['Event']));
        break;

      // Category events
      case 'CATEGORY_CREATED':
      case 'CATEGORY_UPDATED':
      case 'CATEGORY_DELETED':
        console.log('[SSE] 📁 Invalidating category cache');
        dispatch(CategoryAPI.util.invalidateTags(['Category']));
        break;

      // Venue events
      case 'VENUE_CREATED':
      case 'VENUE_UPDATED':
      case 'VENUE_DELETED':
        console.log('[SSE] 📍 Invalidating venue cache');
        dispatch(VenueAPI.util.invalidateTags(['Venue']));
        break;

      // Invitation events
      case 'INVITATION_CREATED':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        console.log('[SSE] ✉️ Invalidating invitation/member cache');
        dispatch(OrganizationMemberAPI.util.invalidateTags(['Invitation', 'OrganizationMember']));
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      default:
        break;
    }
  }, [lastEvent, dispatch]);

  return <SSEContext.Provider value={{ isConnected, lastEvent }}>{children}</SSEContext.Provider>;
};
