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
  TICKET_TYPE_UPDATE     = 'ticket_type:update',
  TICKET_TYPE_DELETE     = 'ticket_type:delete',
  TICKET_TYPE_DEACTIVATE = 'ticket_type:deactivate',

  // Order (private user channel)
  ORDER_CREATE  = 'order:create',
  ORDER_CONFIRM = 'order:confirm',
  ORDER_CANCEL  = 'order:cancel',
  ORDER_EXPIRE  = 'order:expire',

  // Ticket (private user channel)
  TICKET_ISSUE   = 'ticket:issue',
  TICKET_CHECKIN = 'ticket:checkin',
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
  TICKET_TYPE_CREATED     = 'TICKET_TYPE_CREATED',
  TICKET_TYPE_UPDATED     = 'TICKET_TYPE_UPDATED',
  TICKET_TYPE_DELETED     = 'TICKET_TYPE_DELETED',
  TICKET_TYPE_DEACTIVATED = 'TICKET_TYPE_DEACTIVATED',

  // Order (private user channel)
  ORDER_CREATED   = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_EXPIRED   = 'ORDER_EXPIRED',

  // Ticket (private user channel)
  TICKET_ISSUED     = 'TICKET_ISSUED',
  TICKET_CHECKED_IN = 'TICKET_CHECKED_IN',
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

export interface TicketEventData {
  ticketId: number;
  orderId?: number;
  eventId: string;
  eventName: string;
  ticketTypeName?: string;
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
  | { type: SSENormalizedType.TICKET_TYPE_CREATED;     data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_UPDATED;     data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_DELETED;     data: TicketTypeEventData }
  | { type: SSENormalizedType.TICKET_TYPE_DEACTIVATED; data: TicketTypeEventData }
  | { type: SSENormalizedType.ORDER_CREATED;   data: OrderEventData }
  | { type: SSENormalizedType.ORDER_CONFIRMED; data: OrderEventData }
  | { type: SSENormalizedType.ORDER_CANCELLED; data: OrderEventData }
  | { type: SSENormalizedType.ORDER_EXPIRED;   data: OrderEventData }
  | { type: SSENormalizedType.TICKET_ISSUED;     data: TicketEventData }
  | { type: SSENormalizedType.TICKET_CHECKED_IN; data: TicketEventData };

// ============= SSE EVENT INTERFACE =============

export interface SSEEvent {
  type: SSENormalizedType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  timestamp: string;
}

// ============= SSE CONTEXT =============

export interface SSEContextType {
  isConnected: boolean;
  lastEvent: SSEEvent | null;
}

// ============= SSE CHANNELS =============

export type SSEChannel = 'public' | 'organizer' | 'admin' | `user:${string}`;
