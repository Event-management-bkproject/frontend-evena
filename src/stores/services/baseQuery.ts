// baseQuery.ts
import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';
import { setToken, clearCredentials } from '../slices/authSlice';
import { apiLogger } from '@/src/utils/logger/flowLogger';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
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

  // TODO: Backend refresh token not implemented yet
  // If request failed with 401, clear credentials (no refresh logic)
  if (result.error && result.error.status === 401) {
    // Clear credentials on 401 (user needs to login again)
    api.dispatch(clearCredentials());
  }

  // COMMENTED OUT: Refresh token logic (backend not implemented yet)
  // if (result.error && result.error.status === 401) {
  //   const refreshToken = state.auth?.refreshToken;
  //
  //   // Only try to refresh if we have a refresh token
  //   if (refreshToken) {
  //     try {
  //       // Call Next.js API route to refresh token (HTTPOnly cookies)
  //       const refreshResponse = await fetch('/api/auth/refresh', {
  //         method: 'POST',
  //         credentials: 'include',
  //       });
  //
  //       if (refreshResponse.ok) {
  //         const refreshData = await refreshResponse.json();
  //
  //         if (refreshData.success && refreshData.accessToken) {
  //           // Store the new token in Redux
  //           api.dispatch(setToken(refreshData.accessToken));
  //
  //           // Retry the original request with new token
  //           (modifiedArgs.headers as Record<string, string>)['Authorization'] = `Bearer ${refreshData.accessToken}`;
  //           result = await baseQuery(modifiedArgs, api, extraOptions);
  //         } else {
  //           // Refresh failed, clear credentials
  //           api.dispatch(clearCredentials());
  //         }
  //       } else {
  //         // Refresh failed, clear credentials
  //         api.dispatch(clearCredentials());
  //       }
  //     } catch (error) {
  //       console.error('Token refresh error:', error);
  //       api.dispatch(clearCredentials());
  //     }
  //   } else {
  //     // No refresh token, clear credentials
  //     api.dispatch(clearCredentials());
  //   }
  // }

  return result;
};
