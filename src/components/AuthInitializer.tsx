// components/AuthInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Track component mounted state
    isMountedRef.current = true;

    const initializeAuth = async () => {
      // Nếu đã initialized thì không cần check lại
      if (auth.isInitialized) return;

      // Check if we have user in memory (from redux-persist)
      // If user exists, try to get fresh access token from refresh token (httpOnly cookie)
      const hasPersistedUser = auth.user !== null;

      const startTime = Date.now();
      // Show loading screen for first-time visitors
      const MIN_LOADING_TIME = hasPersistedUser ? 0 : 2500;

      // If no user exists, skip API call and mark as initialized
      if (!hasPersistedUser) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setAuthFromInit(null, null);
        }
        return;
      }

      try {
        // Call /api/auth/refresh to get fresh access token
        // Refresh token is automatically sent via httpOnly cookie
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Send httpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Calculate remaining time to meet minimum loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        // Wait for remaining time before setting auth
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          if (data.success && data.data) {
            // Set new access token (from refresh) and user data
            setAuthFromInit(data.data.accessToken, data.data.user);
          } else {
            // Refresh failed
            setAuthFromInit(null, null);
          }
        } else {
          // Refresh token expired or invalid - logout
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

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

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

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [setAuthFromInit, auth.isInitialized, auth.accessToken, dispatch, getMe]);

  // Only show loading page if:
  // 1. Not initialized yet AND
  // 2. No persisted user (first time visitor scenario)
  const hasPersistedUser = auth.user !== null;

  if (!auth.isInitialized && !hasPersistedUser) {
    return <AuthLoadingPage message="Verifying authentication..." />;
  }

  return null;
}
