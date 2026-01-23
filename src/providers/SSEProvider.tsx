'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../stores/hooks';
import { useGetMyOrganizationsQuery } from '../stores/services/OrganizerApi';

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

  // Get user's organizations
  const { data: organizationsData } = useGetMyOrganizationsQuery(undefined, {
    skip: !token, // Skip query if not authenticated
  });

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

    // Add organizer channel if user has any organizations
    if (organizationsData?.data && organizationsData.data.length > 0) {
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
        console.error(`[SSE][${channel}] ❌ Error:`, error);
        eventSourcesRef.current.delete(channel);

        // Reconnect after 3 seconds
        if (eventSourcesRef.current.size === 0) {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[SSE] 🔄 Reconnecting to ${channel}...`);
            setupEventSource(channel);
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
  }, [userId, organizationsData, isAdmin]); // Reconnect when user, organizations, or admin status changes

  return <SSEContext.Provider value={{ isConnected, lastEvent }}>{children}</SSEContext.Provider>;
};
