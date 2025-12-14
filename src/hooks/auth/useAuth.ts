// hook/useAuth.ts
'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  setToken,
  setCredentials,
  clearCredentials,
  setAuthFromInitialization,
  // setRefreshToken, // COMMENTED OUT: Backend refresh token not implemented yet
} from '@/src/stores/slices/authSlice';
import { RootState } from '@/src/stores/store';
import { AuthAPI } from '@/src/stores/services/AuthApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // Updated: Only accessToken, no refreshToken (backend not implemented yet)
  const login = (accessToken: string, user: any, isInitialized: boolean = true) => {
    console.debug('Setting auth:', { accessToken, user });

    // Clear cache before new login
    dispatch(AuthAPI.util.resetApiState());
    dispatch(OrganizerAPI.util.resetApiState());
    dispatch(EventAPI.util.resetApiState());
    dispatch(CategoryAPI.util.resetApiState());
    dispatch(VenueAPI.util.resetApiState());

    dispatch(
      setCredentials({
        accessToken,
        // refreshToken, // COMMENTED OUT: Backend refresh token not implemented yet
        user,
        isInitialized,
      }),
    );

    // AccessToken is now stored in Redux (persisted via redux-persist)
  };

  // Updated: Only accessToken, no refreshToken
  const setAuthFromInit = (
    accessToken: string | null,
    user: any | null,
  ) => {
    dispatch(setAuthFromInitialization({ accessToken, user }));
  };

  const setAuthToken = (token: string) => {
    dispatch(setToken(token));
  };

  const logout = async () => {
    // Clear all cache before logout
    dispatch(AuthAPI.util.resetApiState());
    dispatch(OrganizerAPI.util.resetApiState());
    dispatch(EventAPI.util.resetApiState());
    dispatch(CategoryAPI.util.resetApiState());
    dispatch(VenueAPI.util.resetApiState());

    // Clear credentials from Redux and localStorage
    dispatch(clearCredentials());

    // COMMENTED OUT: Logout API call (backend refresh token not implemented yet)
    // try {
    //   // Call logout API to clear httpOnly cookie
    //   await fetch('/api/auth/logout', {
    //     method: 'POST',
    //     credentials: 'include',
    //   });
    // } catch (error) {
    //   console.error('Logout API error:', error);
    // }
  };

  const checkAuth = async () => {
    try {
      // Get token from Redux state
      const token = auth.accessToken;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        return { isAuthenticated: true, user: data.user };
      }
      return { isAuthenticated: false, user: null };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  };

  return {
    auth,
    login,
    logout,
    setAuthToken,
    checkAuth,
    setAuthFromInit,
    isAuthenticated: !!auth.accessToken,
  };
};
