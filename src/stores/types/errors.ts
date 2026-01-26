// Standardized error types and codes for the application

// Error codes matching backend error responses
export enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  VERSION_CONFLICT = 'VERSION_CONFLICT',

  // Organization errors
  NOT_ORGANIZER = 'NOT_ORGANIZER',
  SELF_INVITATION = 'SELF_INVITATION',
  INVITATION_ALREADY_SENT = 'INVITATION_ALREADY_SENT',
  MEMBER_ALREADY_EXISTS = 'MEMBER_ALREADY_EXISTS',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

// Standardized API error structure
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
  timestamp?: string;
}

// RTK Query error structure
export interface RtkQueryError {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT' | 'CUSTOM_ERROR';
  data?: {
    success: boolean;
    message?: string;
    error?: string;
    code?: ErrorCode;
    errors?: Record<string, string[]>;
  };
  error?: string;
}

// User-friendly error messages
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.UNAUTHORIZED]: 'You need to log in to access this resource.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',

  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'The provided input is invalid.',

  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.ALREADY_EXISTS]: 'This resource already exists.',
  [ErrorCode.CONFLICT]: 'A conflict occurred. Please try again.',
  [ErrorCode.VERSION_CONFLICT]: 'This data has been modified by another user. Please refresh and try again.',

  [ErrorCode.NOT_ORGANIZER]: 'The specified user is not registered as an organizer.',
  [ErrorCode.SELF_INVITATION]: 'You cannot invite yourself to an organization.',
  [ErrorCode.INVITATION_ALREADY_SENT]: 'An invitation has already been sent to this user.',
  [ErrorCode.MEMBER_ALREADY_EXISTS]: 'This user is already a member of the organization.',

  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',

  [ErrorCode.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorCode.TIMEOUT]: 'The request timed out. Please try again.',

  [ErrorCode.UNKNOWN]: 'An unknown error occurred.',
};

// Helper to parse error from RTK Query response
export function parseApiError(error: unknown): ApiError {
  const rtkError = error as RtkQueryError;

  // Network error
  if (rtkError.status === 'FETCH_ERROR') {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: ERROR_MESSAGES[ErrorCode.NETWORK_ERROR],
    };
  }

  // Timeout error
  if (rtkError.status === 'TIMEOUT') {
    return {
      code: ErrorCode.TIMEOUT,
      message: ERROR_MESSAGES[ErrorCode.TIMEOUT],
    };
  }

  // HTTP error with response
  if (typeof rtkError.status === 'number' && rtkError.data) {
    const { message, code, errors } = rtkError.data;

    // Try to detect error code from message if code not provided
    const detectedCode = code || detectErrorCode(message, rtkError.status);

    return {
      code: detectedCode,
      message: message || ERROR_MESSAGES[detectedCode],
      details: errors,
    };
  }

  // Unknown error
  return {
    code: ErrorCode.UNKNOWN,
    message: ERROR_MESSAGES[ErrorCode.UNKNOWN],
  };
}

// Detect error code from message patterns and HTTP status
function detectErrorCode(message: string | undefined, status: number): ErrorCode {
  if (!message) {
    // Default based on HTTP status
    switch (status) {
      case 400:
        return ErrorCode.VALIDATION_ERROR;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 409:
        return ErrorCode.CONFLICT;
      case 500:
        return ErrorCode.INTERNAL_ERROR;
      case 503:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.UNKNOWN;
    }
  }

  const lowerMessage = message.toLowerCase();

  // Version conflict (optimistic locking)
  if (lowerMessage.includes('has been modified by another user') || lowerMessage.includes('version')) {
    return ErrorCode.VERSION_CONFLICT;
  }

  // Not organizer
  if (lowerMessage.includes('not a organizer') || lowerMessage.includes('not an organizer')) {
    return ErrorCode.NOT_ORGANIZER;
  }

  // Self invitation
  if (lowerMessage.includes('cannot invite yourself')) {
    return ErrorCode.SELF_INVITATION;
  }

  // Already invited/member
  if (lowerMessage.includes('already been invited') || lowerMessage.includes('pending invitation')) {
    return ErrorCode.INVITATION_ALREADY_SENT;
  }

  if (lowerMessage.includes('already a member')) {
    return ErrorCode.MEMBER_ALREADY_EXISTS;
  }

  // Not found
  if (lowerMessage.includes('not found')) {
    return ErrorCode.NOT_FOUND;
  }

  // Already exists
  if (lowerMessage.includes('already exists')) {
    return ErrorCode.ALREADY_EXISTS;
  }

  // Authentication
  if (lowerMessage.includes('invalid') && (lowerMessage.includes('email') || lowerMessage.includes('password'))) {
    return ErrorCode.INVALID_CREDENTIALS;
  }

  // Default based on HTTP status
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    default:
      return ErrorCode.UNKNOWN;
  }
}

// Get user-friendly message for an error code
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN];
}
