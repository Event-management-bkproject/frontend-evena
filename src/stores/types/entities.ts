// types/entities.ts
import { EventStatus, OrganizationRole, TicketTypeStatus, UserStatus } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  status: UserStatus;
  roles: Role[];
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  users: User[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  events: Event[];
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  description?: string;
  events: Event[];
}

export interface Organization {
  id: number;
  owner: User;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  events: Event[];
  members: OrganizationMember[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: number;
  organization: Organization;
  user: User;
  role: OrganizationRole;
  invitationAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  coverUrl?: string;
  organization: Organization;
  category: Category;
  venue: Venue;
  images: EventImage[];
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface EventImage {
  id: number;
  event: Event;
  url: string;
  idx: number;
}

export interface TicketType {
  id: number;
  event: Event;
  name: string;
  description?: string;
  price: number;
  currency: string;
  total: number;
  sold: number;
  perUserLimit?: number;
  salesStart: string;
  salesEnd: string;
  status: TicketTypeStatus;
  earlyBird: boolean;
  earlyBirdDiscount?: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}
