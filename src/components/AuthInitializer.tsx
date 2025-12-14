// components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useDispatch } from 'react-redux';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';
import { useLazyGetMeQuery } from '@/src/stores/services/AuthApi';
import { AuthLoadingPage } from './AuthLoadingPage';

export default function AuthInitializer() {
  const { setAuthFromInit, auth } = useAuth();
  const dispatch = useDispatch();
  const [getMe] = useLazyGetMeQuery();

  useEffect(() => {
    const initializeAuth = async () => {
      // Nếu đã initialized thì không cần check lại
      if (auth.isInitialized) return;

      // Check if we have token in localStorage (from redux-persist)
      // If yes, skip loading screen - user is already logged in
      const hasPersistedToken = typeof window !== 'undefined' &&
        (auth.accessToken || localStorage.getItem('accessToken'));

      const startTime = Date.now();
      // Only show loading screen for minimum time if no persisted token (first time login)
      const MIN_LOADING_TIME = hasPersistedToken ? 0 : 2500;

      // If no token exists, skip API call and mark as initialized
      if (!hasPersistedToken) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        setAuthFromInit(null, null);
        return;
      }

      try {
        // Only call /api/auth/me if we have a token to verify
        // AccessToken is stored in Redux persist (localStorage)
        const response = await getMe().unwrap();

        // Calculate remaining time to meet minimum loading time (áp dụng cho tất cả trường hợp)
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        // Wait for remaining time before setting auth
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        if (response.success && response.data) {
          // Get accessToken from API response (or from Redux persist)
          const accessToken = response.accessToken || auth.accessToken || null;
          // const refreshToken = response.refreshToken || null; // COMMENTED OUT: Backend refresh token not implemented yet

          if (accessToken) {
            // Set auth with accessToken only
            setAuthFromInit(accessToken, response.data);
          } else {
            // No token found
            setAuthFromInit(null, null);
          }
        } else {
          // No valid session
          setAuthFromInit(null, null);

          // Clear cache
          dispatch(OrganizerAPI.util.resetApiState());
          dispatch(EventAPI.util.resetApiState());
          dispatch(CategoryAPI.util.resetApiState());
          dispatch(VenueAPI.util.resetApiState());
        }
      } catch (error) {
        // Only log error if it's not a 401 (unauthorized is expected when token is invalid)
        const is401 = error && typeof error === 'object' && 'status' in error && error.status === 401;
        if (!is401) {
          console.error('Auth initialization error:', error);
        }

        // Calculate remaining time even for error case
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        // Clear auth state on error
        setAuthFromInit(null, null);

        // Clear cache
        dispatch(OrganizerAPI.util.resetApiState());
        dispatch(EventAPI.util.resetApiState());
        dispatch(CategoryAPI.util.resetApiState());
        dispatch(VenueAPI.util.resetApiState());
      }
    };

    initializeAuth();
  }, [setAuthFromInit, auth.isInitialized, auth.accessToken, dispatch, getMe]);

  // Only show loading page if:
  // 1. Not initialized yet AND
  // 2. No persisted token (first time login scenario)
  const hasPersistedToken = typeof window !== 'undefined' &&
    (auth.accessToken || localStorage.getItem('accessToken'));

  if (!auth.isInitialized && !hasPersistedToken) {
    return <AuthLoadingPage message="Verifying authentication..." />;
  }

  return null;
}
