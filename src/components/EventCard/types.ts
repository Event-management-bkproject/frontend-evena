// EventCard component types

import { EventListResponse } from '@/src/stores/types';

export interface EventCardProps {
  event: EventListResponse;
  onEdit?: (event: EventListResponse) => void;
  onDelete?: (event: EventListResponse) => void;
  onClick?: (event: EventListResponse) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export interface EventGridProps {
  events: EventListResponse[];
  onEdit?: (event: EventListResponse) => void;
  onDelete?: (event: EventListResponse) => void;
  onClick?: (event: EventListResponse) => void;
  showActions?: boolean;
}
