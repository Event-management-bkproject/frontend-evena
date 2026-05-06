// baseQuery.ts
import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';
import { clearCredentials, setCredentials } from '../slices/authSlice';
import { apiLogger } from '@/src/utils/logger/flowLogger';
import { Mutex } from 'async-mutex';
import type { UserResponse } from '../types/auth';

interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    user: UserResponse;
  };
}

// Create a mutex to prevent multiple refresh requests
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include', // Send httpOnly cookies
  // Do NOT set Content-Type here: fetchBaseQuery sets it automatically to
  // 'application/json' for plain-object bodies and leaves it unset for
  // FormData (letting the browser inject the multipart boundary). Forcing
  // 'application/json' globally breaks all multipart file-upload endpoints.
});

export const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // Get token from Redux store
  const state = api.getState() as RootState;
  const token = state.auth?.accessToken;

  // Create modified args with authorization header
  const modifiedArgs = typeof args === 'string' ? { url: args } : { ...args };

  // Add headers if not exist
  if (!modifiedArgs.headers) {
    modifiedArgs.headers = {};
  }

  // Add authorization header if token exists
  if (token) {
    (modifiedArgs.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Log API request
  const url = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : (args.method || 'GET');
  apiLogger.info(`API Request: ${method} ${url}`, {
    method,
    url,
    hasAuth: !!token,
  });

  // Make the initial request
  const startTime = Date.now();
  let result = await baseQuery(modifiedArgs, api, extraOptions);
  const duration = Date.now() - startTime;

  // Log API response
  if (result.error) {
    apiLogger.error(`API Error: ${method} ${url}`, {
      method,
      url,
      status: result.error.status,
      error: result.error.data,
      duration: `${duration}ms`,
    });
  } else {
    apiLogger.info(`API Success: ${method} ${url}`, {
      method,
      url,
      duration: `${duration}ms`,
    });
  }

  // Handle 401 errors with refresh token
  if (result.error && result.error.status === 401) {
    // Wait until mutex is available (prevent multiple refresh requests)
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        apiLogger.info('Attempting to refresh access token...');

        // Try to refresh token
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            credentials: 'include',
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const refreshData = refreshResult.data as RefreshTokenResponse;

          if (refreshData.success && refreshData.data) {
            // Store new access token and user data
            api.dispatch(setCredentials({
              accessToken: refreshData.data.accessToken,
              user: refreshData.data.user,
            }));

            apiLogger.info('Access token refreshed successfully');

            // Retry original request with new token
            (modifiedArgs.headers as Record<string, string>)['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            result = await baseQuery(modifiedArgs, api, extraOptions);
          } else {
            // Refresh failed - logout user
            apiLogger.warn('Refresh token invalid - logging out');
            api.dispatch(clearCredentials());
          }
        } else {
          // Refresh failed - logout user
          apiLogger.warn('Refresh token expired - logging out');
          api.dispatch(clearCredentials());
        }
      } catch (error) {
        apiLogger.error('Token refresh error', { error });
        api.dispatch(clearCredentials());
      } finally {
        release();
      }
    } else {
      // Wait for refresh to complete, then retry
      await mutex.waitForUnlock();

      // Get fresh token after refresh completes
      const freshState = api.getState() as RootState;
      const freshToken = freshState.auth?.accessToken;

      if (freshToken) {
        (modifiedArgs.headers as Record<string, string>)['Authorization'] = `Bearer ${freshToken}`;
        result = await baseQuery(modifiedArgs, api, extraOptions);
      }
    }
  }

  return result;
};
