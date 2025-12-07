// OrganizationCard component types

import { OrganizationResponse } from '@/src/stores/types';

export interface OrganizationCardProps {
  organization: OrganizationResponse;
  onEdit?: (org: OrganizationResponse) => void;
  onDelete?: (org: OrganizationResponse) => void;
  onClick?: (org: OrganizationResponse) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export interface OrganizationGridProps {
  organizations: OrganizationResponse[];
  onEdit?: (org: OrganizationResponse) => void;
  onDelete?: (org: OrganizationResponse) => void;
  onClick?: (org: OrganizationResponse) => void;
  showActions?: boolean;
}
