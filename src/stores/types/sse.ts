// SSE Event Types - aligned with sse-service/config/actions.json
// and backend SSENotificationService.java data shapes

// ============= SSE ACTION ENUM (wire format from sse-service) =============
// Values match the action keys in actions.json exactly.
// Add a new entry here + matching entry in actions.json when adding a new event.

export enum SSEAction {
  // Organization
  ORG_CREATE    = 'organization:create',
  ORG_UPDATE    = 'organization:update',
  ORG_DELETE    = 'organization:delete',
  ORG_VERIFY    = 'organization:verify',
  ORG_UNVERIFY  = 'organization:unverify',

  // Event
  EVENT_CREATE  = 'event:create',
  EVENT_UPDATE  = 'event:update',
  EVENT_DELETE  = 'event:delete',
  EVENT_PUBLISH = 'event:publish',
  EVENT_CANCEL  = 'event:cancel',

  // Category
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // Venue
  VENUE_CREATE  = 'venue:create',
  VENUE_UPDATE  = 'venue:update',
  VENUE_DELETE  = 'venue:delete',

  // Invitation
  INVITATION_CREATE = 'invitation:create',
  INVITATION_ACCEPT = 'invitation:accept',
  INVITATION_REJECT = 'invitation:reject',

  // TicketType
  TICKET_TYPE_CREATE     = 'ticket_type:create',
  TICKET_TYPE_ACTIVATE   = 'ticket_type:activate',
  TICKET_TYPE_UPDATE     = 'ticket_type:update',
  TICKET_TYPE_DELETE     = 'ticket_type:delete',
  TICKET_TYPE_DEACTIVATE = 'ticket_type:deactivate',

  // Order (private user channel)
  ORDER_CREATE  = 'order:create',
  ORDER_CONFIRM = 'order:confirm',
  ORDER_CANCEL  = 'order:cancel',
  ORDER_EXPIRE  = 'order:expire',
  ORDER_REFUND  = 'order:refund',

  // Ticket (private user channel)
  TICKET_ISSUE   = 'ticket:issue',
  TICKET_CHECKIN = 'ticket:checkin',

  // Refund Request (private user channel)
  REFUND_REQUEST_CREATED   = 'refund:created',
  REFUND_REQUEST_REJECTED  = 'refund:reject',
  REFUND_REQUEST_COMPLETED = 'refund:completed',
  REFUND_REQUEST_FAILED    = 'refund:failed',

  // FlexPass listing — organizer,admin channel (SSE-018)
  FLEXPASS_LISTING_CREATED   = 'flexpass:listing_created',
  FLEXPASS_LISTING_CANCELLED = 'flexpass:listing_cancelled',
  // FlexPass listing — user:{sellerId} channel (SSE-019)
  FLEXPASS_LISTING_APPROVED  = 'flexpass:listing_approved',
  FLEXPASS_LISTING_REJECTED  = 'flexpass:listing_rejected',
  FLEXPASS_LISTING_EXPIRED   = 'flexpass:listing_expired',
  FLEXPASS_PRICE_LOCKED      = 'flexpass:price_locked',
  // FlexPass sale window — organizer,admin channel (SSE-018)
  FLEXPASS_SALE_WINDOW_CREATED   = 'flexpass:sale_window_created',
  FLEXPASS_SALE_WINDOW_CANCELLED = 'flexpass:sale_window_cancelled',
  FLEXPASS_SALE_WINDOW_OPENED    = 'flexpass:sale_window_opened',
  FLEXPASS_SALE_WINDOW_CLOSED    = 'flexpass:sale_window_closed',
  // FlexPass purchase — user:{buyerId} + user:{sellerId} channels (SSE-019)
  FLEXPASS_TRANSFER_COMPLETED = 'flexpass:transfer_completed',
  FLEXPASS_TRANSFER_FAILED    = 'flexpass:transfer_failed',
  FLEXPASS_REFUND_PENDING     = 'flexpass:refund_pending',
  FLEXPASS_REFUND_COMPLETED   = 'flexpass:refund_completed',
  FLEXPASS_REFUND_FAILED      = 'flexpass:refund_failed',

  // In-app notification signal (SSE-021)
  NOTIFICATION_NEW = 'notification:new',
}

// ============= SSE NORMALIZED TYPE ENUM (used in frontend cache invalidation) =============
// Values are SCREAMING_SNAKE_CASE to distinguish from wire-format actions.
// Add a new entry here + matching SSEAction + SSEEventData variant when adding a new event.

export enum SSENormalizedType {
  // Organization
  ORGANIZATION_CREATED    = 'ORGANIZATION_CREATED',
  ORGANIZATION_UPDATED    = 'ORGANIZATION_UPDATED',
  ORGANIZATION_DELETED    = 'ORGANIZATION_DELETED',
  ORGANIZATION_VERIFIED   = 'ORGANIZATION_VERIFIED',
  ORGANIZATION_UNVERIFIED = 'ORGANIZATION_UNVERIFIED',

  // Event
  EVENT_CREATED   = 'EVENT_CREATED',
  EVENT_UPDATED   = 'EVENT_UPDATED',
  EVENT_DELETED   = 'EVENT_DELETED',
  EVENT_PUBLISHED = 'EVENT_PUBLISHED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',

  // Category
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',

  // Venue
  VENUE_CREATED = 'VENUE_CREATED',
  VENUE_UPDATED = 'VENUE_UPDATED',
  VENUE_DELETED = 'VENUE_DELETED',

  // Invitation
  INVITATION_CREATED  = 'INVITATION_CREATED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_REJECTED = 'INVITATION_REJECTED',

  // TicketType
  TICKET_TYPE_CREATED    = 'TICKET_TYPE_CREATED',
  TICKET_TYPE_ACTIVATED  = 'TICKET_TYPE_ACTIVATED',
  TICKET_TYPE_UPDATED    = 'TICKET_TYPE_UPDATED',
  TICKET_TYPE_DELETED    = 'TICKET_TYPE_DELETED',
  TICKET_TYPE_DEACTIVATED = 'TICKET_TYPE_DEACTIVATED',

  // Order (private user channel)
  ORDER_CREATED   = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_EXPIRED   = 'ORDER_EXPIRED',
  ORDER_REFUNDED  = 'ORDER_REFUNDED',

  // Ticket (private user channel)
  TICKET_ISSUED     = 'TICKET_ISSUED',
  TICKET_CHECKED_IN = 'TICKET_CHECKED_IN',

  // Refund Request (private user channel)
  REFUND_REQUEST_CREATED   = 'REFUND_REQUEST_CREATED',
  REFUND_REQUEST_REJECTED  = 'REFUND_REQUEST_REJECTED',
  REFUND_REQUEST_COMPLETED = 'REFUND_REQUEST_COMPLETED',
  REFUND_REQUEST_FAILED    = 'REFUND_REQUEST_FAILED',

  // FlexPass listing — organizer,admin channel (SSE-018)
  FLEXPASS_LISTING_CREATED   = 'FLEXPASS_LISTING_CREATED',
  FLEXPASS_LISTING_CANCELLED = 'FLEXPASS_LISTING_CANCELLED',
  // FlexPass listing — user:{sellerId} channel (SSE-019)
  FLEXPASS_LISTING_APPROVED = 'FLEXPASS_LISTING_APPROVED',
  FLEXPASS_LISTING_REJECTED = 'FLEXPASS_LISTING_REJECTED',
  FLEXPASS_LISTING_EXPIRED  = 'FLEXPASS_LISTING_EXPIRED',
  FLEXPASS_PRICE_LOCKED     = 'FLEXPASS_PRICE_LOCKED',
  // FlexPass sale window — organizer,admin channel (SSE-018)
  FLEXPASS_SALE_WINDOW_CREATED   = 'FLEXPASS_SALE_WINDOW_CREATED',
  FLEXPASS_SALE_WINDOW_CANCELLED = 'FLEXPASS_SALE_WINDOW_CANCELLED',
  FLEXPASS_SALE_WINDOW_OPENED    = 'FLEXPASS_SALE_WINDOW_OPENED',
  FLEXPASS_SALE_WINDOW_CLOSED    = 'FLEXPASS_SALE_WINDOW_CLOSED',
  // FlexPass purchase — user:{buyerId} + user:{sellerId} channels (SSE-019)
  FLEXPASS_TRANSFER_COMPLETED = 'FLEXPASS_TRANSFER_COMPLETED',
  FLEXPASS_TRANSFER_FAILED    = 'FLEXPASS_TRANSFER_FAILED',
  FLEXPASS_REFUND_PENDING     = 'FLEXPASS_REFUND_PENDING',
  FLEXPASS_REFUND_COMPLETED   = 'FLEXPASS_REFUND_COMPLETED',
  FLEXPASS_REFUND_FAILED      = 'FLEXPASS_REFUND_FAILED',

  // In-app notification signal (SSE-021)
  NOTIFICATION_NEW = 'NOTIFICATION_NEW',
}

// ============= SSE EVENT DATA SHAPES =============
// Matching SSENotificationService.java emit data payloads

export interface OrganizationEventData {
  organizationId: number;
  organizationName: string;
}

export interface EventEventData {
  eventId: string;
  eventName: string;
  organizationId?: number;
}

export interface CategoryEventData {
  categoryId: number;
  categoryName: string;
}

export interface VenueEventData {
  venueId: number;
  venueName: string;
}

export interface InvitationEventData {
  invitationId: number;
  organizationId: number;
  organizationName: string;
  inviteeEmail?: string;
  userId?: string;
  userName?: string;
}

export interface TicketTypeEventData {
  ticketTypeId: number;
  eventId: string;
  eventName: string;
  ticketTypeName: string;
}

export interface OrderEventData {
  orderId: number;
  eventId: string;
  eventName: string;
  ticketCount?: number;
}

export interface OrderRefundEventData {
  orderId: number;
  eventId: string;
  eventName: string;
  refundAmount?: number; // declared exception per spec §7.2 — allowed only on user:{id} channel
}

export interface TicketEventData {
  ticketId: number;
  orderId?: number;
  eventId: string;
  eventName: string;
  ticketTypeName?: string;
}

export interface RefundRequestCreatedEventData {
  refundRequestId: number;
  orderId: number;
  eventId: string;
  eventName: string;
  requesterName: string;
}

export interface RefundRequestRejectedEventData {
  refundRequestId: number;
  orderId: number;
  eventId: string;
  eventName: string;
  reviewNote?: string;
}

export interface RefundRequestCompletedEventData {
  refundRequestId: number;
  orderId: number;
  eventId: string;
  eventName: string;
  organizerNotification?: boolean;
}

export interface RefundRequestFailedEventData {
  refundRequestId: number;
  orderId: number;
  eventId: string;
  eventName: string;
  organizerNotification?: boolean;
}

export interface FlexPassListingEventData {
  listingId: number;
  ticketId: number;
  eventId: string;
  eventName: string;
  sellerId: string;
  status: string;
  rejectionReason?: string;
}

export interface FlexPassSaleWindowEventData {
  saleWindowId: number;
  eventId: string;
  eventName: string;
  status: string;
}

export interface FlexPassPurchaseEventData {
  purchaseId?: number;
  listingId: number;
  eventId: string;
  eventName: string;
  buyerId: string;
  sellerId: string;
  status?: string;
}

/** @deprecated use RefundRequestCreatedEventData or RefundRequestRejectedEventData */
export interface RefundRequestEventData {
  refundRequestId: number;
  orderId: number;
  eventName: string;
  reviewNote?: string;
}

// ============= DISCRIMINATED UNION =============

export type SSEEventData =
  | { type: SSENormalizedType.ORGANIZATION_CREATED;    data: OrganizationEventData }
  | { type: SSENormalizedType.ORGANIZATION_UPDATED;    data: OrganizationEventData }
  | { type: SSENormalizedType.ORGANIZATION_DELETED;    data: OrganizationEventData }
  | { type: SSENormalizedType.ORGANIZATION_VERIFIED;   data: OrganizationEventData }
  | { type: SSENormalizedType.ORGANIZATION_UNVERIFIED; data: OrganizationEventData }
  | { type: SSENormalizedType.EVENT_CREATED;   data: EventEventData }
  | { type: SSENormalizedType.EVENT_UPDATED;   data: EventEventData }
  | { type: SSENormalizedType.EVENT_DELETED;   data: EventEventData }
  | { type: SSENormalizedType.EVENT_PUBLISHED; data: EventEventData }
  | { type: SSENormalizedType.EVENT_CANCELLED; data: EventEventData }
  | { type: SSENormalizedType.CATEGORY_CREATED; data: CategoryEventData }
  | { type: SSENormalizedType.CATEGORY_UPDATED; data: CategoryEventData }
  | { type: SSENormalizedType.CATEGORY_DELETED; data: CategoryEventData }
  | { type: SSENormalizedType.VENUE_CREATED; data: VenueEventData }
  | { type: SSENormalizedType.VENUE_UPDATED; data: VenueEventData }
  | { type: SSENormalizedType.VENUE_DELETED; data: VenueEventData }
  | { type: SSENormalizedType.INVITATION_CREATED;  data: InvitationEventData }
  | { type: SSENormalizedType.INVITATION_ACCEPTED; data: InvitationEventData }
  | { type: SSENormalizedType.INVITATION_REJECTED; data: InvitationEventData }
  | { type: SSENormalizedType.TICKET_TYPE_CREATED;    data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_ACTIVATED;  data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_UPDATED;    data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_DELETED;    data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_DEACTIVATED; data: TicketTypeEventData }
  | { type: SSENormalizedType.ORDER_CREATED;   data: OrderEventData }
  | { type: SSENormalizedType.ORDER_CONFIRMED; data: OrderEventData }
  | { type: SSENormalizedType.ORDER_CANCELLED; data: OrderEventData }
  | { type: SSENormalizedType.ORDER_EXPIRED;   data: OrderEventData }
  | { type: SSENormalizedType.ORDER_REFUNDED;  data: OrderRefundEventData }
  | { type: SSENormalizedType.TICKET_ISSUED;     data: TicketEventData }
  | { type: SSENormalizedType.TICKET_CHECKED_IN; data: TicketEventData }
  | { type: SSENormalizedType.REFUND_REQUEST_CREATED;   data: RefundRequestCreatedEventData }
  | { type: SSENormalizedType.REFUND_REQUEST_REJECTED;  data: RefundRequestRejectedEventData }
  | { type: SSENormalizedType.REFUND_REQUEST_COMPLETED; data: RefundRequestCompletedEventData }
  | { type: SSENormalizedType.REFUND_REQUEST_FAILED;    data: RefundRequestFailedEventData }
  | { type: SSENormalizedType.FLEXPASS_LISTING_CREATED;   data: FlexPassListingEventData }
  | { type: SSENormalizedType.FLEXPASS_LISTING_CANCELLED; data: FlexPassListingEventData }
  | { type: SSENormalizedType.FLEXPASS_LISTING_APPROVED;  data: FlexPassListingEventData }
  | { type: SSENormalizedType.FLEXPASS_LISTING_REJECTED;  data: FlexPassListingEventData }
  | { type: SSENormalizedType.FLEXPASS_LISTING_EXPIRED;   data: FlexPassListingEventData }
  | { type: SSENormalizedType.FLEXPASS_PRICE_LOCKED;      data: FlexPassListingEventData }
  | { type: SSENormalizedType.FLEXPASS_SALE_WINDOW_CREATED;   data: FlexPassSaleWindowEventData }
  | { type: SSENormalizedType.FLEXPASS_SALE_WINDOW_CANCELLED; data: FlexPassSaleWindowEventData }
  | { type: SSENormalizedType.FLEXPASS_SALE_WINDOW_OPENED;    data: FlexPassSaleWindowEventData }
  | { type: SSENormalizedType.FLEXPASS_SALE_WINDOW_CLOSED;    data: FlexPassSaleWindowEventData }
  | { type: SSENormalizedType.FLEXPASS_TRANSFER_COMPLETED; data: FlexPassPurchaseEventData }
  | { type: SSENormalizedType.FLEXPASS_TRANSFER_FAILED;    data: FlexPassPurchaseEventData }
  | { type: SSENormalizedType.FLEXPASS_REFUND_PENDING;     data: FlexPassPurchaseEventData }
  | { type: SSENormalizedType.FLEXPASS_REFUND_COMPLETED;   data: FlexPassPurchaseEventData }
  | { type: SSENormalizedType.FLEXPASS_REFUND_FAILED;      data: FlexPassPurchaseEventData };

// ============= SSE EVENT INTERFACE =============

export interface SSEEvent {
  type: SSENormalizedType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  timestamp: string;
  /** The SSE channel this event arrived on (e.g. 'organizer', 'admin', 'user:123') */
  channel: string;
}

// ============= SSE CONTEXT =============

export interface SSEContextType {
  isConnected: boolean;
  lastEvent: SSEEvent | null;
}

// ============= SSE CHANNELS =============

export type SSEChannel = 'public' | 'organizer' | 'admin' | `user:${string}`;
