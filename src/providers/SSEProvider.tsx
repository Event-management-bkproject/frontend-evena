'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../stores/hooks';
import { EventAPI } from '../stores/services/EventApi';
import { OrganizerAPI } from '../stores/services/OrganizerApi';
import { CategoryAPI } from '../stores/services/CategoryApi';
import { VenueAPI } from '../stores/services/VenueApi';
import { OrganizationMemberAPI } from '../stores/services/OrganizationMemberApi';
import { TicketTypeAPI } from '../stores/services/TicketTypeApi';
import { OrderAPI } from '../stores/services/OrderApi';
import { SSEAction, SSENormalizedType } from '../stores/types/sse';
import type { SSEContextType, SSEEvent } from '../stores/types/sse';

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

    // Add user-specific channel for order/ticket updates (private to this user)
    if (userId) {
      channels.push(`user:${userId}`);
    }

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
      const handleEvent = (label: string, normalized: SSENormalizedType) => (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data);
        console.log(`[SSE][${channel}] ${label}:`, parsedData);
        setLastEvent({
          type: normalized,
          data: parsedData.data || parsedData,
          timestamp: new Date().toISOString(),
        });
      };

      const on = (action: SSEAction, label: string, normalized: SSENormalizedType) => {
        eventSource.addEventListener(action, handleEvent(label, normalized));
      };

      // Organization events
      on(SSEAction.ORG_CREATE,   'Organization created',            SSENormalizedType.ORGANIZATION_CREATED);
      on(SSEAction.ORG_UPDATE,   'Organization updated',            SSENormalizedType.ORGANIZATION_UPDATED);
      on(SSEAction.ORG_DELETE,   'Organization deleted',            SSENormalizedType.ORGANIZATION_DELETED);
      on(SSEAction.ORG_VERIFY,   'Organization verified',           SSENormalizedType.ORGANIZATION_VERIFIED);
      on(SSEAction.ORG_UNVERIFY, 'Organization needs re-verification', SSENormalizedType.ORGANIZATION_UNVERIFIED);

      // Invitation events
      on(SSEAction.INVITATION_CREATE, 'Invitation sent',     SSENormalizedType.INVITATION_CREATED);
      on(SSEAction.INVITATION_ACCEPT, 'Invitation accepted', SSENormalizedType.INVITATION_ACCEPTED);
      on(SSEAction.INVITATION_REJECT, 'Invitation rejected', SSENormalizedType.INVITATION_REJECTED);

      // Event events
      on(SSEAction.EVENT_CREATE,  'Event created',    SSENormalizedType.EVENT_CREATED);
      on(SSEAction.EVENT_UPDATE,  'Event updated',    SSENormalizedType.EVENT_UPDATED);
      on(SSEAction.EVENT_DELETE,  'Event deleted',    SSENormalizedType.EVENT_DELETED);
      on(SSEAction.EVENT_PUBLISH, 'Event published',  SSENormalizedType.EVENT_PUBLISHED);
      on(SSEAction.EVENT_CANCEL,  'Event cancelled',  SSENormalizedType.EVENT_CANCELLED);

      // Category events
      on(SSEAction.CATEGORY_CREATE, 'Category created', SSENormalizedType.CATEGORY_CREATED);
      on(SSEAction.CATEGORY_UPDATE, 'Category updated', SSENormalizedType.CATEGORY_UPDATED);
      on(SSEAction.CATEGORY_DELETE, 'Category deleted', SSENormalizedType.CATEGORY_DELETED);

      // Venue events
      on(SSEAction.VENUE_CREATE, 'Venue created', SSENormalizedType.VENUE_CREATED);
      on(SSEAction.VENUE_UPDATE, 'Venue updated', SSENormalizedType.VENUE_UPDATED);
      on(SSEAction.VENUE_DELETE, 'Venue deleted', SSENormalizedType.VENUE_DELETED);

      // TicketType events
      on(SSEAction.TICKET_TYPE_CREATE,     'Ticket type created',     SSENormalizedType.TICKET_TYPE_CREATED);
      on(SSEAction.TICKET_TYPE_UPDATE,     'Ticket type updated',     SSENormalizedType.TICKET_TYPE_UPDATED);
      on(SSEAction.TICKET_TYPE_DELETE,     'Ticket type deleted',     SSENormalizedType.TICKET_TYPE_DELETED);
      on(SSEAction.TICKET_TYPE_DEACTIVATE, 'Ticket type deactivated', SSENormalizedType.TICKET_TYPE_DEACTIVATED);

      // Order events (private user channel)
      on(SSEAction.ORDER_CREATE,  'Order created',   SSENormalizedType.ORDER_CREATED);
      on(SSEAction.ORDER_CONFIRM, 'Order confirmed', SSENormalizedType.ORDER_CONFIRMED);
      on(SSEAction.ORDER_CANCEL,  'Order cancelled', SSENormalizedType.ORDER_CANCELLED);
      on(SSEAction.ORDER_EXPIRE,  'Order expired',   SSENormalizedType.ORDER_EXPIRED);

      // Ticket events (private user channel)
      on(SSEAction.TICKET_ISSUE,   'Ticket issued',      SSENormalizedType.TICKET_ISSUED);
      on(SSEAction.TICKET_CHECKIN, 'Ticket checked in',  SSENormalizedType.TICKET_CHECKED_IN);

      // Heartbeat event
      eventSource.addEventListener('heartbeat', () => {
        console.log(`[SSE][${channel}] 💓 Heartbeat`);
      });

      eventSource.onerror = (error) => {
        if (error) {
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
  }, [userId, token, isOrganizer, isAdmin]); // Reconnect when user, token, role, or admin status changes

  // Global SSE cache invalidation - handles all RTK Query cache updates
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastEvent) return;

    const { type } = lastEvent;
    console.log('[SSE] 🔄 Cache invalidation for event:', type);

    const data = lastEvent.data;

    switch (type) {
      // Organization events - targeted when ID available
      case SSENormalizedType.ORGANIZATION_UPDATED:
      case SSENormalizedType.ORGANIZATION_VERIFIED:
      case SSENormalizedType.ORGANIZATION_UNVERIFIED: {
        const orgId = data?.organizationId;
        console.log('[SSE] 🏢 Invalidating organization cache', orgId ? `(id: ${orgId})` : '');
        if (orgId) {
          dispatch(OrganizerAPI.util.invalidateTags([{ type: 'Organizer', id: orgId }, 'Organizer']));
        } else {
          dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        }
        break;
      }
      case SSENormalizedType.ORGANIZATION_CREATED:
      case SSENormalizedType.ORGANIZATION_DELETED:
        console.log('[SSE] 🏢 Invalidating organization cache (list)');
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      // Event events - targeted when ID available
      case SSENormalizedType.EVENT_UPDATED:
      case SSENormalizedType.EVENT_PUBLISHED:
      case SSENormalizedType.EVENT_CANCELLED: {
        const eventId = data?.eventId;
        console.log('[SSE] 🎉 Invalidating event cache', eventId ? `(id: ${eventId})` : '');
        if (eventId) {
          dispatch(EventAPI.util.invalidateTags([{ type: 'Event', id: eventId }, 'Event']));
        } else {
          dispatch(EventAPI.util.invalidateTags(['Event']));
        }
        break;
      }
      case SSENormalizedType.EVENT_CREATED:
      case SSENormalizedType.EVENT_DELETED:
        console.log('[SSE] 🎉 Invalidating event cache (list)');
        dispatch(EventAPI.util.invalidateTags(['Event']));
        break;

      // Category events - always broad (small dataset)
      case SSENormalizedType.CATEGORY_CREATED:
      case SSENormalizedType.CATEGORY_UPDATED:
      case SSENormalizedType.CATEGORY_DELETED:
        console.log('[SSE] 📁 Invalidating category cache');
        dispatch(CategoryAPI.util.invalidateTags(['Category']));
        break;

      // Venue events - always broad (small dataset)
      case SSENormalizedType.VENUE_CREATED:
      case SSENormalizedType.VENUE_UPDATED:
      case SSENormalizedType.VENUE_DELETED:
        console.log('[SSE] 📍 Invalidating venue cache');
        dispatch(VenueAPI.util.invalidateTags(['Venue']));
        break;

      // Invitation events
      case SSENormalizedType.INVITATION_CREATED:
      case SSENormalizedType.INVITATION_ACCEPTED:
      case SSENormalizedType.INVITATION_REJECTED:
        console.log('[SSE] ✉️ Invalidating invitation/member cache');
        dispatch(OrganizationMemberAPI.util.invalidateTags(['Invitation', 'OrganizationMember']));
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      // TicketType events - targeted by eventId
      case SSENormalizedType.TICKET_TYPE_CREATED:
      case SSENormalizedType.TICKET_TYPE_UPDATED:
      case SSENormalizedType.TICKET_TYPE_DELETED:
      case SSENormalizedType.TICKET_TYPE_DEACTIVATED: {
        const ttEventId = data?.eventId;
        console.log('[SSE] 🎫 Invalidating ticket type cache', ttEventId ? `(eventId: ${ttEventId})` : '');
        if (ttEventId) {
          dispatch(TicketTypeAPI.util.invalidateTags([{ type: 'TicketType', id: ttEventId }]));
          dispatch(EventAPI.util.invalidateTags([{ type: 'Event', id: ttEventId }, 'Event']));
        } else {
          dispatch(TicketTypeAPI.util.invalidateTags(['TicketType']));
          dispatch(EventAPI.util.invalidateTags(['Event']));
        }
        break;
      }

      // Order events (private user channel) - targeted by eventId
      case SSENormalizedType.ORDER_CREATED:
      case SSENormalizedType.ORDER_CONFIRMED:
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED: {
        const orderEventId = data?.eventId;
        console.log('[SSE] 🛒 Invalidating order cache');
        dispatch(OrderAPI.util.invalidateTags(['Order']));
        if (orderEventId) {
          dispatch(TicketTypeAPI.util.invalidateTags([{ type: 'TicketType', id: orderEventId }]));
          dispatch(EventAPI.util.invalidateTags([{ type: 'Event', id: orderEventId }]));
        }
        if (type === SSENormalizedType.ORDER_CONFIRMED) {
          dispatch(OrderAPI.util.invalidateTags(['Ticket']));
        }
        break;
      }

      // Ticket events (private user channel)
      case SSENormalizedType.TICKET_ISSUED:
      case SSENormalizedType.TICKET_CHECKED_IN:
        console.log('[SSE] 🎫 Invalidating ticket cache');
        dispatch(OrderAPI.util.invalidateTags(['Ticket']));
        break;

      default:
        break;
    }
  }, [lastEvent, dispatch]);

  return <SSEContext.Provider value={{ isConnected, lastEvent }}>{children}</SSEContext.Provider>;
};
