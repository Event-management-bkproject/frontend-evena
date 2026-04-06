'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../stores/hooks';
import { EventAPI } from '../stores/services/EventApi';
import { OrganizerAPI } from '../stores/services/OrganizerApi';
import { CategoryAPI } from '../stores/services/CategoryApi';
import { VenueAPI } from '../stores/services/VenueApi';
import { OrganizationMemberAPI } from '../stores/services/OrganizationMemberApi';
import { TicketTypeAPI } from '../stores/services/TicketTypeApi';
import { OrderAPI } from '../stores/services/OrderApi';
import { SSEAction, SSENormalizedType } from '../stores/types/sse';
import type { SSEContextType, SSEEvent, SSENotification } from '../stores/types/sse';

const SSEContext = createContext<SSEContextType>({
  isConnected: false,
  lastEvent: null,
  notification: null,
  clearNotification: () => {},
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

const SSE_BASE_URL = process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:8000';
const RECONNECT_DELAY_MS = 3000;

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken);
  const userId = user?.id;
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;
  const isOrganizer = user?.roles?.includes('ORGANIZER') ?? false;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [notification, setNotification] = useState<SSENotification | null>(null);

  const clearNotification = useCallback(() => setNotification(null), []);

  // Per-channel EventSource map
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  // Per-channel reconnect timeouts — prevents one timeout overwriting another
  const reconnectTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Tracks whether the current effect instance is still active (not cleaned up)
  const isEffectActiveRef = useRef(false);

  useEffect(() => {
    // Mark this effect instance as active
    isEffectActiveRef.current = true;

    if (!userId || !token) {
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
      reconnectTimersRef.current.forEach((t) => clearTimeout(t));
      reconnectTimersRef.current.clear();
      setIsConnected(false);
      return;
    }

    const channels: string[] = ['public', `user:${userId}`];
    if (isOrganizer) channels.push('organizer');
    if (isAdmin) channels.push('admin');

    // Close connections no longer in the channel list
    eventSourcesRef.current.forEach((es, channel) => {
      if (!channels.includes(channel)) {
        es.close();
        eventSourcesRef.current.delete(channel);
        const timer = reconnectTimersRef.current.get(channel);
        if (timer) {
          clearTimeout(timer);
          reconnectTimersRef.current.delete(channel);
        }
      }
    });

    const setupEventSource = (channel: string) => {
      // Skip if already connected to this channel
      if (eventSourcesRef.current.has(channel)) return;

      const sseUrl = `${SSE_BASE_URL}/sse/stream/${encodeURIComponent(channel)}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      const handleEvent = (normalized: SSENormalizedType) => (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data);
        setLastEvent({
          type: normalized,
          data: parsedData.data ?? parsedData,
          timestamp: new Date().toISOString(),
          channel,
        });
      };

      const on = (action: SSEAction, normalized: SSENormalizedType) => {
        eventSource.addEventListener(action, handleEvent(normalized));
      };

      // Organization events
      on(SSEAction.ORG_CREATE,   SSENormalizedType.ORGANIZATION_CREATED);
      on(SSEAction.ORG_UPDATE,   SSENormalizedType.ORGANIZATION_UPDATED);
      on(SSEAction.ORG_DELETE,   SSENormalizedType.ORGANIZATION_DELETED);
      on(SSEAction.ORG_VERIFY,   SSENormalizedType.ORGANIZATION_VERIFIED);
      on(SSEAction.ORG_UNVERIFY, SSENormalizedType.ORGANIZATION_UNVERIFIED);

      // Invitation events
      on(SSEAction.INVITATION_CREATE, SSENormalizedType.INVITATION_CREATED);
      on(SSEAction.INVITATION_ACCEPT, SSENormalizedType.INVITATION_ACCEPTED);
      on(SSEAction.INVITATION_REJECT, SSENormalizedType.INVITATION_REJECTED);

      // Event events
      on(SSEAction.EVENT_CREATE,  SSENormalizedType.EVENT_CREATED);
      on(SSEAction.EVENT_UPDATE,  SSENormalizedType.EVENT_UPDATED);
      on(SSEAction.EVENT_DELETE,  SSENormalizedType.EVENT_DELETED);
      on(SSEAction.EVENT_PUBLISH, SSENormalizedType.EVENT_PUBLISHED);
      on(SSEAction.EVENT_CANCEL,  SSENormalizedType.EVENT_CANCELLED);

      // Category events
      on(SSEAction.CATEGORY_CREATE, SSENormalizedType.CATEGORY_CREATED);
      on(SSEAction.CATEGORY_UPDATE, SSENormalizedType.CATEGORY_UPDATED);
      on(SSEAction.CATEGORY_DELETE, SSENormalizedType.CATEGORY_DELETED);

      // Venue events
      on(SSEAction.VENUE_CREATE, SSENormalizedType.VENUE_CREATED);
      on(SSEAction.VENUE_UPDATE, SSENormalizedType.VENUE_UPDATED);
      on(SSEAction.VENUE_DELETE, SSENormalizedType.VENUE_DELETED);

      // TicketType events
      on(SSEAction.TICKET_TYPE_CREATE,     SSENormalizedType.TICKET_TYPE_CREATED);
      on(SSEAction.TICKET_TYPE_ACTIVATE,   SSENormalizedType.TICKET_TYPE_ACTIVATED);
      on(SSEAction.TICKET_TYPE_UPDATE,     SSENormalizedType.TICKET_TYPE_UPDATED);
      on(SSEAction.TICKET_TYPE_DELETE,     SSENormalizedType.TICKET_TYPE_DELETED);
      on(SSEAction.TICKET_TYPE_DEACTIVATE, SSENormalizedType.TICKET_TYPE_DEACTIVATED);

      // Order events (private user channel)
      on(SSEAction.ORDER_CREATE,  SSENormalizedType.ORDER_CREATED);
      on(SSEAction.ORDER_CONFIRM, SSENormalizedType.ORDER_CONFIRMED);
      on(SSEAction.ORDER_CANCEL,  SSENormalizedType.ORDER_CANCELLED);
      on(SSEAction.ORDER_EXPIRE,  SSENormalizedType.ORDER_EXPIRED);
      on(SSEAction.ORDER_REFUND,  SSENormalizedType.ORDER_REFUNDED);

      // Ticket events (private user channel)
      on(SSEAction.TICKET_ISSUE,   SSENormalizedType.TICKET_ISSUED);
      on(SSEAction.TICKET_CHECKIN, SSENormalizedType.TICKET_CHECKED_IN);

      eventSource.addEventListener('heartbeat', () => {
        // Heartbeat received — connection alive
      });

      eventSource.onerror = () => {
        // Remove failed connection from map
        eventSourcesRef.current.delete(channel);

        // Cancel any existing reconnect timer for this channel
        const existingTimer = reconnectTimersRef.current.get(channel);
        if (existingTimer) {
          clearTimeout(existingTimer);
          reconnectTimersRef.current.delete(channel);
        }

        // Only schedule reconnect if this effect instance is still active
        // (prevents stale closures from creating duplicate connections after cleanup)
        if (!isEffectActiveRef.current) return;

        if (eventSourcesRef.current.size === 0) {
          setIsConnected(false);
        }

        // Per-channel reconnect with independent timer
        const timer = setTimeout(() => {
          reconnectTimersRef.current.delete(channel);
          // Double-check effect is still active before reconnecting
          if (isEffectActiveRef.current) {
            setupEventSource(channel);
          }
        }, RECONNECT_DELAY_MS);

        reconnectTimersRef.current.set(channel, timer);
      };

      eventSourcesRef.current.set(channel, eventSource);
    };

    channels.forEach(setupEventSource);

    return () => {
      // Mark this effect instance as inactive — prevents stale onerror reconnects
      isEffectActiveRef.current = false;

      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
      reconnectTimersRef.current.forEach((t) => clearTimeout(t));
      reconnectTimersRef.current.clear();
      setIsConnected(false);
    };
  }, [userId, token, isOrganizer, isAdmin]);

  // Global SSE cache invalidation — handles all RTK Query cache updates
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastEvent) return;

    const { type, data, channel } = lastEvent;
    const isPersonalChannel = channel.startsWith('user:');

    switch (type) {
      // Organization events - targeted when ID available
      case SSENormalizedType.ORGANIZATION_UPDATED:
      case SSENormalizedType.ORGANIZATION_UNVERIFIED: {
        const orgId = data?.organizationId;
        if (orgId) {
          dispatch(OrganizerAPI.util.invalidateTags([{ type: 'Organizer', id: orgId }, 'Organizer']));
        } else {
          dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        }
        break;
      }

      case SSENormalizedType.ORGANIZATION_VERIFIED: {
        const orgId = data?.organizationId;
        const orgName = data?.organizationName as string | undefined;
        if (orgId) {
          dispatch(OrganizerAPI.util.invalidateTags([{ type: 'Organizer', id: orgId }, 'Organizer']));
        } else {
          dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        }
        // Personal notification to the specific org owner
        if (isPersonalChannel && orgName) {
          setNotification({
            message: `Your organization "${orgName}" has been verified by admin!`,
            severity: 'success',
          });
        }
        break;
      }

      case SSENormalizedType.ORGANIZATION_CREATED:
      case SSENormalizedType.ORGANIZATION_DELETED:
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      // Event events - targeted when ID available
      case SSENormalizedType.EVENT_UPDATED:
      case SSENormalizedType.EVENT_PUBLISHED:
      case SSENormalizedType.EVENT_CANCELLED: {
        const eventId = data?.eventId;
        if (eventId) {
          dispatch(EventAPI.util.invalidateTags([{ type: 'Event', id: eventId }, 'Event']));
        } else {
          dispatch(EventAPI.util.invalidateTags(['Event']));
        }
        break;
      }
      case SSENormalizedType.EVENT_CREATED:
      case SSENormalizedType.EVENT_DELETED:
        dispatch(EventAPI.util.invalidateTags(['Event']));
        break;

      // Category events
      case SSENormalizedType.CATEGORY_CREATED:
      case SSENormalizedType.CATEGORY_UPDATED:
      case SSENormalizedType.CATEGORY_DELETED:
        dispatch(CategoryAPI.util.invalidateTags(['Category']));
        break;

      // Venue events
      case SSENormalizedType.VENUE_CREATED:
      case SSENormalizedType.VENUE_UPDATED:
      case SSENormalizedType.VENUE_DELETED:
        dispatch(VenueAPI.util.invalidateTags(['Venue']));
        break;

      // Invitation events
      case SSENormalizedType.INVITATION_CREATED:
      case SSENormalizedType.INVITATION_ACCEPTED:
      case SSENormalizedType.INVITATION_REJECTED:
        dispatch(OrganizationMemberAPI.util.invalidateTags(['Invitation', 'OrganizationMember']));
        dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
        break;

      // TicketType events — CREATED/UPDATED/DELETED: only invalidate TicketType (spec §8)
      // ACTIVATED/DEACTIVATED: also invalidate Event because availability visible to public
      case SSENormalizedType.TICKET_TYPE_CREATED:
      case SSENormalizedType.TICKET_TYPE_UPDATED:
      case SSENormalizedType.TICKET_TYPE_DELETED: {
        const ttEventId = data?.eventId;
        if (ttEventId) {
          dispatch(TicketTypeAPI.util.invalidateTags([{ type: 'TicketType', id: ttEventId }]));
        } else {
          dispatch(TicketTypeAPI.util.invalidateTags(['TicketType']));
        }
        break;
      }
      case SSENormalizedType.TICKET_TYPE_ACTIVATED:
      case SSENormalizedType.TICKET_TYPE_DEACTIVATED: {
        const ttEventId = data?.eventId;
        if (ttEventId) {
          dispatch(TicketTypeAPI.util.invalidateTags([{ type: 'TicketType', id: ttEventId }]));
          dispatch(EventAPI.util.invalidateTags([{ type: 'Event', id: ttEventId }, 'Event']));
        } else {
          dispatch(TicketTypeAPI.util.invalidateTags(['TicketType']));
          dispatch(EventAPI.util.invalidateTags(['Event']));
        }
        break;
      }

      // Order events (private user channel)
      case SSENormalizedType.ORDER_CREATED:
      case SSENormalizedType.ORDER_CONFIRMED:
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED: {
        const orderEventId = data?.eventId;
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

      // order:refund — invalidate Order only (spec §8 ORDER_REFUNDED)
      case SSENormalizedType.ORDER_REFUNDED: {
        dispatch(OrderAPI.util.invalidateTags(['Order']));
        const refundAmount = data?.refundAmount;
        const eventName = data?.eventName as string | undefined;
        if (isPersonalChannel && refundAmount != null && eventName) {
          setNotification({
            message: `Refund of ${refundAmount.toLocaleString()} has been processed for "${eventName}"`,
            severity: 'info',
          });
        }
        break;
      }

      // Ticket events
      case SSENormalizedType.TICKET_ISSUED:
      case SSENormalizedType.TICKET_CHECKED_IN:
        dispatch(OrderAPI.util.invalidateTags(['Ticket']));
        break;

      default:
        break;
    }
  }, [lastEvent, dispatch]);

  return (
    <SSEContext.Provider value={{ isConnected, lastEvent, notification, clearNotification }}>
      {children}
      {/* Global personal SSE notification toast */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={clearNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={clearNotification}
          severity={notification?.severity ?? 'info'}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </SSEContext.Provider>
  );
};
