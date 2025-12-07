// EventFilters component types

import { CategoryResponse, EventListResponse } from '@/src/stores/types';
import { EventStatus } from '@/src/stores/types/enums';

export interface EventFiltersProps {
  onSearch: (keyword: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onTimeRangeChange: (range: 'week' | 'month' | 'year' | 'all') => void;
  onStatusChange: (status: EventStatus | null) => void;
  onCreateClick: () => void;
  categories: CategoryResponse[];
  events?: EventListResponse[];
  loading?: boolean;
  disabled?: boolean;
}
