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

// ============= ERROR RESPONSES =============

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}

/**
 * Business Rule Violation Error Response (HTTP 409 CONFLICT)
 * Returned when attempting to violate business rules like:
 * - Modifying immutable ticket types after event is published
 * - Deleting ticket types with sold tickets
 * - Modifying critical event fields after publication
 */
export interface BusinessRuleViolationResponse extends ApiErrorResponse {
  ruleCode: BusinessRuleCode;
}

export type BusinessRuleCode =
  | 'TICKET_TYPE_IMMUTABLE'
  | 'EVENT_CRITICAL_UPDATE_FORBIDDEN'
  | 'EVENT_ALREADY_PUBLISHED'
  | 'TICKET_TYPE_HAS_SALES'
  | 'EVENT_STATUS_CHANGE_FORBIDDEN';

/**
 * Helper function to check if an error is a business rule violation
 */
export function isBusinessRuleViolation(error: unknown): error is BusinessRuleViolationResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'ruleCode' in error &&
    'status' in error &&
    (error as BusinessRuleViolationResponse).status === 409
  );
}
