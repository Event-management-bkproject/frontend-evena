// types/api.ts
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Common query parameters
export interface Pageable {
  page?: number;
  size?: number;
  sort?: string;
}

// Search parameters
export interface SearchParams extends Pageable {
  keyword?: string;
}
