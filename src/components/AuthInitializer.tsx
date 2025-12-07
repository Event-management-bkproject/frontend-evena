// components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/hook/useAuth';
import { useDispatch } from 'react-redux';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';
import { useLazyGetMeQuery } from '@/src/stores/services/AuthApi';

export default function AuthInitializer() {
  const { setAuthFromInit, auth } = useAuth();
  const dispatch = useDispatch();
  const [getMe, { isLoading }] = useLazyGetMeQuery();

  useEffect(() => {
    const initializeAuth = async () => {
      // Nếu đã initialized thì không cần check lại
      if (auth.isInitialized) return;

      const startTime = Date.now();
      const MIN_LOADING_TIME = 2500; // Hiển thị loading tối thiểu 2.5 giây

      try {
        // Call /api/auth/me which will read tokens from HTTPOnly cookies
        // This API returns both user data AND accessToken from the cookie
        const response = await getMe().unwrap();

        // Calculate remaining time to meet minimum loading time (áp dụng cho tất cả trường hợp)
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        // Wait for remaining time before setting auth
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        if (response.success && response.data) {
          // Get tokens from API response (it reads from HTTPOnly cookies)
          const accessToken = response.accessToken || null;
          const refreshToken = response.refreshToken || null;

          if (accessToken && refreshToken) {
            // Set auth with tokens from cookies
            setAuthFromInit(accessToken, refreshToken, response.data);
          } else {
            // No tokens found in cookies
            setAuthFromInit(null, null, null);
          }
        } else {
          // No valid session
          setAuthFromInit(null, null, null);

          // Clear cache
          dispatch(OrganizerAPI.util.resetApiState());
          dispatch(EventAPI.util.resetApiState());
          dispatch(CategoryAPI.util.resetApiState());
          dispatch(VenueAPI.util.resetApiState());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);

        // Calculate remaining time even for error case
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        // Clear auth state on error
        setAuthFromInit(null, null, null);

        // Clear cache
        dispatch(OrganizerAPI.util.resetApiState());
        dispatch(EventAPI.util.resetApiState());
        dispatch(CategoryAPI.util.resetApiState());
        dispatch(VenueAPI.util.resetApiState());
      }
    };

    initializeAuth();
  }, [setAuthFromInit, auth.isInitialized, dispatch, getMe]);

  return null;
}
