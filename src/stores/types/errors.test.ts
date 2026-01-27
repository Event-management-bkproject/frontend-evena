import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  parseApiError,
  getErrorMessage,
  ERROR_MESSAGES,
} from './errors';

describe('Error Types', () => {
  describe('parseApiError', () => {
    it('parses network error correctly', () => {
      const error = { status: 'FETCH_ERROR' };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.message).toBe(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
    });

    it('parses timeout error correctly', () => {
      const error = { status: 'TIMEOUT' };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.TIMEOUT);
      expect(result.message).toBe(ERROR_MESSAGES[ErrorCode.TIMEOUT]);
    });

    it('parses 401 unauthorized error correctly', () => {
      const error = {
        status: 401,
        data: { success: false, message: 'Unauthorized' },
      };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('parses 404 not found error correctly', () => {
      const error = {
        status: 404,
        data: { success: false, message: 'Resource not found' },
      };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('detects version conflict from message', () => {
      const error = {
        status: 400,
        data: {
          success: false,
          message: 'This organization has been modified by another user',
        },
      };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.VERSION_CONFLICT);
    });

    it('detects not organizer error from message', () => {
      const error = {
        status: 400,
        data: {
          success: false,
          message: 'User is not a organizer',
        },
      };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.NOT_ORGANIZER);
    });

    it('detects self invitation error from message', () => {
      const error = {
        status: 400,
        data: {
          success: false,
          message: 'You cannot invite yourself',
        },
      };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.SELF_INVITATION);
    });

    it('detects already invited error from message', () => {
      const error = {
        status: 400,
        data: {
          success: false,
          message: 'User has already been invited',
        },
      };
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.INVITATION_ALREADY_SENT);
    });

    it('returns unknown for unrecognized errors', () => {
      const error = {};
      const result = parseApiError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN);
    });

    it('includes error details when available', () => {
      const error = {
        status: 400,
        data: {
          success: false,
          message: 'Validation failed',
          errors: { email: ['Invalid email format'] },
        },
      };
      const result = parseApiError(error);

      expect(result.details).toEqual({ email: ['Invalid email format'] });
    });
  });

  describe('getErrorMessage', () => {
    it('returns correct message for known error codes', () => {
      expect(getErrorMessage(ErrorCode.INVALID_CREDENTIALS)).toBe(
        'Invalid email or password'
      );
      expect(getErrorMessage(ErrorCode.NETWORK_ERROR)).toBe(
        'Unable to connect to the server. Please check your internet connection.'
      );
      expect(getErrorMessage(ErrorCode.VERSION_CONFLICT)).toBe(
        'This data has been modified by another user. Please refresh and try again.'
      );
    });

    it('returns unknown message for undefined codes', () => {
      expect(getErrorMessage('INVALID_CODE' as ErrorCode)).toBe(
        ERROR_MESSAGES[ErrorCode.UNKNOWN]
      );
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('has messages for all error codes', () => {
      const allCodes = Object.values(ErrorCode);

      allCodes.forEach((code) => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code]).toBe('string');
        expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
      });
    });
  });
});
