'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../stores/hooks';

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
  const userId = user?.id; // Only track user ID for reconnection logic
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Disconnect if user logged out
    if (!userId || !token) {
      if (eventSourceRef.current) {
        console.log('[SSE] 🔌 Disconnecting: User logged out');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Skip if connection already exists for this user
    if (eventSourceRef.current) {
      console.log('[SSE] ⏭️ Skipping reconnect: Connection already active for user', userId);
      return;
    }

    const connectSSE = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log('[SSE] 🔌 Connecting to SSE service...');

      const sseUrl = `http://localhost:8001/subscribe?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('connected', (e) => {
        console.log('[SSE] ✅ Connected:', e.data);
        setIsConnected(true);

        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      // Organization events
      eventSource.addEventListener('ORGANIZATION_CREATED', (e) => {
        console.log('[SSE] 🏢 Organization created:', JSON.parse(e.data));
        setLastEvent({ type: 'ORGANIZATION_CREATED', data: JSON.parse(e.data), timestamp: new Date().toISOString() });
      });

      eventSource.addEventListener('ORGANIZATION_UPDATED', (e) => {
        console.log('[SSE] 🏢 Organization updated:', JSON.parse(e.data));
        setLastEvent({ type: 'ORGANIZATION_UPDATED', data: JSON.parse(e.data), timestamp: new Date().toISOString() });
      });

      eventSource.addEventListener('ORGANIZATION_DELETED', (e) => {
        console.log('[SSE] 🏢 Organization deleted:', JSON.parse(e.data));
        setLastEvent({ type: 'ORGANIZATION_DELETED', data: JSON.parse(e.data), timestamp: new Date().toISOString() });
      });

      // Event events
      eventSource.addEventListener('EVENT_CREATED', (e) => {
        console.log('[SSE] 🎉 Event created:', JSON.parse(e.data));
        setLastEvent({ type: 'EVENT_CREATED', data: JSON.parse(e.data), timestamp: new Date().toISOString() });
      });

      eventSource.addEventListener('EVENT_UPDATED', (e) => {
        console.log('[SSE] 🎉 Event updated:', JSON.parse(e.data));
        setLastEvent({ type: 'EVENT_UPDATED', data: JSON.parse(e.data), timestamp: new Date().toISOString() });
      });

      eventSource.addEventListener('EVENT_DELETED', (e) => {
        console.log('[SSE] 🎉 Event deleted:', JSON.parse(e.data));
        setLastEvent({ type: 'EVENT_DELETED', data: JSON.parse(e.data), timestamp: new Date().toISOString() });
      });

      eventSource.onerror = (error) => {
        console.error('[SSE] ❌ Error:', error);
        setIsConnected(false);

        // Reconnect after 3 seconds
        if (eventSourceRef.current === eventSource) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[SSE] 🔄 Reconnecting...');
            connectSSE();
          }, 3000);
        }
      };

      eventSourceRef.current = eventSource;
    };

    // Connect to SSE
    connectSSE();

    // Cleanup on unmount or when auth changes
    return () => {
      console.log('[SSE] 🔌 Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId]); // Only reconnect when user changes, not token

  return <SSEContext.Provider value={{ isConnected, lastEvent }}>{children}</SSEContext.Provider>;
};
