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
import { RefundRequestAPI } from '../stores/services/RefundRequestApi';
import { FlexPassAPI } from '../stores/services/FlexPassApi';
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

      // Refund Request events (private user channel)
      on(SSEAction.REFUND_REQUEST_CREATED,   SSENormalizedType.REFUND_REQUEST_CREATED);
      on(SSEAction.REFUND_REQUEST_REJECTED,  SSENormalizedType.REFUND_REQUEST_REJECTED);
      on(SSEAction.REFUND_REQUEST_COMPLETED, SSENormalizedType.REFUND_REQUEST_COMPLETED);
      on(SSEAction.REFUND_REQUEST_FAILED,    SSENormalizedType.REFUND_REQUEST_FAILED);

      // FlexPass listing events — organizer,admin channel (SSE-018)
      on(SSEAction.FLEXPASS_LISTING_CREATED,   SSENormalizedType.FLEXPASS_LISTING_CREATED);
      on(SSEAction.FLEXPASS_LISTING_CANCELLED, SSENormalizedType.FLEXPASS_LISTING_CANCELLED);
      // FlexPass listing events — user:{sellerId} channel (SSE-019)
      on(SSEAction.FLEXPASS_LISTING_APPROVED, SSENormalizedType.FLEXPASS_LISTING_APPROVED);
      on(SSEAction.FLEXPASS_LISTING_REJECTED, SSENormalizedType.FLEXPASS_LISTING_REJECTED);
      on(SSEAction.FLEXPASS_LISTING_EXPIRED,  SSENormalizedType.FLEXPASS_LISTING_EXPIRED);
      on(SSEAction.FLEXPASS_PRICE_LOCKED,     SSENormalizedType.FLEXPASS_PRICE_LOCKED);
      // FlexPass sale window events — organizer,admin channel (SSE-018)
      on(SSEAction.FLEXPASS_SALE_WINDOW_CREATED,   SSENormalizedType.FLEXPASS_SALE_WINDOW_CREATED);
      on(SSEAction.FLEXPASS_SALE_WINDOW_CANCELLED, SSENormalizedType.FLEXPASS_SALE_WINDOW_CANCELLED);
      on(SSEAction.FLEXPASS_SALE_WINDOW_OPENED,    SSENormalizedType.FLEXPASS_SALE_WINDOW_OPENED);
      on(SSEAction.FLEXPASS_SALE_WINDOW_CLOSED,    SSENormalizedType.FLEXPASS_SALE_WINDOW_CLOSED);
      // FlexPass purchase events — user:{buyerId} + user:{sellerId} channels (SSE-019)
      on(SSEAction.FLEXPASS_TRANSFER_COMPLETED, SSENormalizedType.FLEXPASS_TRANSFER_COMPLETED);
      on(SSEAction.FLEXPASS_TRANSFER_FAILED,    SSENormalizedType.FLEXPASS_TRANSFER_FAILED);
      on(SSEAction.FLEXPASS_REFUND_PENDING,     SSENormalizedType.FLEXPASS_REFUND_PENDING);
      on(SSEAction.FLEXPASS_REFUND_COMPLETED,   SSENormalizedType.FLEXPASS_REFUND_COMPLETED);
      on(SSEAction.FLEXPASS_REFUND_FAILED,      SSENormalizedType.FLEXPASS_REFUND_FAILED);

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

      // ORDER_CONFIRMED — SSE-009: MUST invalidate Order + Ticket ONLY.
      // MUST NOT invalidate Event or TicketType (snapshot isolation).
      case SSENormalizedType.ORDER_CONFIRMED: {
        dispatch(OrderAPI.util.invalidateTags(['Order', 'Ticket']));
        // Only show customer toast. Organizer notifications (organizerNotification:true)
        // are handled by OrganizerOrdersTable to avoid "Your tickets are confirmed" on organizer side.
        if (isPersonalChannel && !data?.organizerNotification) {
          const eventName = data?.eventName as string | undefined;
          setNotification({
            message: eventName
              ? `Payment successful! Your tickets for "${eventName}" are confirmed.`
              : 'Payment successful! Your tickets are confirmed.',
            severity: 'success',
          });
        }
        break;
      }

      // ORDER_CREATED — invalidate Order only (no capacity change committed yet)
      case SSENormalizedType.ORDER_CREATED:
        dispatch(OrderAPI.util.invalidateTags(['Order']));
        break;

      // ORDER_CANCELLED / ORDER_EXPIRED — capacity freed, so refresh TicketType + Event
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED: {
        dispatch(OrderAPI.util.invalidateTags(['Order']));
        const orderEventId = data?.eventId;
        if (orderEventId) {
          dispatch(TicketTypeAPI.util.invalidateTags([{ type: 'TicketType', id: orderEventId }]));
          dispatch(EventAPI.util.invalidateTags([{ type: 'Event', id: orderEventId }]));
        }
        break;
      }

      // ORDER_REFUNDED — SSE-010: invalidate Order only.
      // refundAmount is the declared §7.2 exception — display in customer private toast only.
      // Organizer notifications (organizerNotification:true) are handled by OrganizerOrdersTable.
      case SSENormalizedType.ORDER_REFUNDED: {
        dispatch(OrderAPI.util.invalidateTags(['Order']));
        if (isPersonalChannel && !data?.organizerNotification) {
          const refundAmount = data?.refundAmount as number | undefined;
          const eventName = data?.eventName as string | undefined;
          setNotification({
            message: refundAmount != null && eventName
              ? `Refund of ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundAmount)} has been processed for "${eventName}".`
              : 'Your refund has been processed.',
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

      // Refund Request created — notify organizer on their private channel
      case SSENormalizedType.REFUND_REQUEST_CREATED: {
        dispatch(RefundRequestAPI.util.invalidateTags(['RefundRequest']));
        if (isPersonalChannel) {
          const eventName = data?.eventName as string | undefined;
          const requesterName = data?.requesterName as string | undefined;
          setNotification({
            message: requesterName && eventName
              ? `${requesterName} requested a refund for "${eventName}".`
              : 'A new refund request has been submitted.',
            severity: 'info',
          });
        }
        break;
      }

      // Refund Request completed — invalidate cache; notify customer (not organizer toast)
      case SSENormalizedType.REFUND_REQUEST_COMPLETED: {
        dispatch(RefundRequestAPI.util.invalidateTags(['RefundRequest']));
        if (isPersonalChannel && !data?.organizerNotification) {
          const eventName = data?.eventName as string | undefined;
          setNotification({
            message: eventName
              ? `Your refund request for "${eventName}" has been completed.`
              : 'Your refund request has been completed.',
            severity: 'success',
          });
        }
        break;
      }

      // Refund Request failed — invalidate organizer cache + show warning
      case SSENormalizedType.REFUND_REQUEST_FAILED: {
        dispatch(RefundRequestAPI.util.invalidateTags(['RefundRequest']));
        if (isPersonalChannel && data?.organizerNotification) {
          const eventName = data?.eventName as string | undefined;
          const orderId = data?.orderId as number | undefined;
          setNotification({
            message: orderId && eventName
              ? `Refund processing failed for order #${orderId} — "${eventName}". Please review.`
              : 'A refund processing request has failed.',
            severity: 'error',
          });
        }
        break;
      }

      // Refund Request rejected — notify customer with reviewNote
      case SSENormalizedType.REFUND_REQUEST_REJECTED: {
        dispatch(RefundRequestAPI.util.invalidateTags(['RefundRequest']));
        if (isPersonalChannel) {
          const eventName = data?.eventName as string | undefined;
          const reviewNote = data?.reviewNote as string | undefined;
          setNotification({
            message: reviewNote
              ? `Your refund request for "${eventName ?? 'event'}" was rejected: ${reviewNote}`
              : `Your refund request for "${eventName ?? 'event'}" was rejected.`,
            severity: 'warning',
          });
        }
        break;
      }

      // FlexPass listing events — invalidate listings cache
      case SSENormalizedType.FLEXPASS_LISTING_CREATED:
      case SSENormalizedType.FLEXPASS_LISTING_CANCELLED:
      case SSENormalizedType.FLEXPASS_LISTING_APPROVED:
      case SSENormalizedType.FLEXPASS_LISTING_REJECTED:
      case SSENormalizedType.FLEXPASS_LISTING_EXPIRED:
      case SSENormalizedType.FLEXPASS_PRICE_LOCKED:
        dispatch(FlexPassAPI.util.invalidateTags(['FlexPassListing']));
        if (isPersonalChannel) {
          const eventName = data?.eventName as string | undefined;
          const status = data?.status as string | undefined;
          if (lastEvent?.type === SSENormalizedType.FLEXPASS_LISTING_APPROVED && eventName) {
            setNotification({ message: `Your listing for "${eventName}" was approved.`, severity: 'success' });
          } else if (lastEvent?.type === SSENormalizedType.FLEXPASS_LISTING_REJECTED && eventName) {
            const reason = data?.rejectionReason as string | undefined;
            setNotification({ message: reason ? `Listing rejected: ${reason}` : `Your listing for "${eventName}" was rejected.`, severity: 'warning' });
          } else if (lastEvent?.type === SSENormalizedType.FLEXPASS_LISTING_EXPIRED && eventName) {
            setNotification({ message: `Your FlexPass listing for "${eventName}" has expired.`, severity: 'info' });
          } else if (lastEvent?.type === SSENormalizedType.FLEXPASS_PRICE_LOCKED && eventName) {
            setNotification({ message: `Price locked for your FlexPass listing — "${eventName}".`, severity: 'info' });
          } else if (status) {
            void status; // suppress unused warning
          }
        }
        break;

      // FlexPass sale window events — invalidate listings + sale window cache
      case SSENormalizedType.FLEXPASS_SALE_WINDOW_CREATED:
      case SSENormalizedType.FLEXPASS_SALE_WINDOW_CANCELLED:
      case SSENormalizedType.FLEXPASS_SALE_WINDOW_OPENED:
      case SSENormalizedType.FLEXPASS_SALE_WINDOW_CLOSED:
        dispatch(FlexPassAPI.util.invalidateTags(['FlexPassListing', 'FlexPassSaleWindow']));
        break;

      // FlexPass purchase events — invalidate listings cache; notify buyer/seller
      case SSENormalizedType.FLEXPASS_TRANSFER_COMPLETED:
      case SSENormalizedType.FLEXPASS_TRANSFER_FAILED:
      case SSENormalizedType.FLEXPASS_REFUND_PENDING:
      case SSENormalizedType.FLEXPASS_REFUND_COMPLETED:
      case SSENormalizedType.FLEXPASS_REFUND_FAILED:
        dispatch(FlexPassAPI.util.invalidateTags(['FlexPassListing']));
        if (isPersonalChannel) {
          const eventName = data?.eventName as string | undefined;
          if (lastEvent?.type === SSENormalizedType.FLEXPASS_TRANSFER_COMPLETED && eventName) {
            setNotification({ message: `FlexPass transfer completed for "${eventName}".`, severity: 'success' });
          } else if (lastEvent?.type === SSENormalizedType.FLEXPASS_TRANSFER_FAILED && eventName) {
            setNotification({ message: `FlexPass transfer failed for "${eventName}". Refund will be processed.`, severity: 'error' });
          } else if (lastEvent?.type === SSENormalizedType.FLEXPASS_REFUND_COMPLETED && eventName) {
            setNotification({ message: `FlexPass refund completed for "${eventName}".`, severity: 'success' });
          } else if (lastEvent?.type === SSENormalizedType.FLEXPASS_REFUND_FAILED && eventName) {
            setNotification({ message: `FlexPass refund failed for "${eventName}". Please contact support.`, severity: 'error' });
          }
        }
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
