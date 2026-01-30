// types/event.ts
import { UserResponseSimplified } from './auth';
import { EventStatus, OrganizationRole, TicketTypeStatus } from './enums';

// Request DTOs
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  description?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  organizerId: number;
  categoryId: number;
  venueId: number;
  coverUrl?: string;
  imageUrls?: string[];
}

// Alias for form usage - same as CreateEventRequest
export type EventFormData = CreateEventRequest;

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status?: EventStatus;
  coverUrl?: string;
  categoryId?: number;
  venueId?: number;
  imageUrls?: string[];
}

export interface EventSearchRequest {
  keyword?: string;
  categoryId?: number;
  city?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

// Response DTOs
export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  eventCount: number;
}

export interface VenueResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  description?: string;
}

export interface OrganizationResponse {
  id: number;
  owner: UserResponseSimplified;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  totalEvents: number;
  totalMembers?: number;
  members?: OrganizationMemberResponse[];
  version: number; // For optimistic locking
}

export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  version: number; // Required for optimistic locking
}

export interface OrganizationMemberResponse {
  id: number;
  userId: string;
  userName: string;
  email: string;
  phone?: string;
  organizationId?: number;
  organizationName?: string;
  role: OrganizationRole;
  invitationAccepted: boolean;
  joinedAt?: string;
  invitedAt: string;
}

export interface OrganizationDetailResponse {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  totalEvents: number;
  totalMembers: number;
  members: OrganizationMemberResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  totalOrders: number;
  soldPercentage: number;
}

export interface TicketTypeSummary {
  id: number;
  name: string;
  price: number;
  currency: string;
  total: number;
  sold: number;
  available: number;
  status: TicketTypeStatus;
  salesStart: string;
  salesEnd: string;
}

export interface EventListResponse {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  coverUrl?: string;
  categoryId: number;
  categoryName: string;
  venueName: string;
  city: string;
  organizerName: string;
  minPrice: number;
  availableTickets: number;
  soldPercentage: number;
  eventVersion: number;
  createdAt: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  coverUrl?: string;
  imageUrls: string[];
  organizer: OrganizationResponse;
  category: CategoryResponse;
  venue: VenueResponse;
  ticketTypes: TicketTypeSummary[];
  stats: EventStats;
  eventVersion: number;
  createdAt: string;
  updatedAt: string;
}

// TicketType DTOs
export interface CreateTicketTypeRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  total: number;
  perUserLimit?: number;
  salesStart: string;
  salesEnd: string;
  earlyBird?: boolean;
  earlyBirdDiscount?: number;
  visible?: boolean;
}

export interface UpdateTicketTypeRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  total?: number;
  perUserLimit?: number;
  salesStart?: string;
  salesEnd?: string;
  status?: TicketTypeStatus;
  earlyBird?: boolean;
  earlyBirdDiscount?: number;
  visible?: boolean;
}

export interface TicketTypeResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  total: number;
  sold: number;
  available: number;
  perUserLimit?: number;
  salesStart: string;
  salesEnd: string;
  status: TicketTypeStatus;
  earlyBird: boolean;
  earlyBirdDiscount?: number;
  visible: boolean;
  soldPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeListResponse {
  id: number;
  name: string;
  price: number;
  currency: string;
  total: number;
  sold: number;
  available: number;
  status: TicketTypeStatus;
  salesStart: string;
  salesEnd: string;
  visible: boolean;
}

// OrganizationMember DTOs
export interface InviteMemberRequest {
  email: string;
  role: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}
