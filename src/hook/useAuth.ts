// hook/useAuth.ts
'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  setToken,
  setCredentials,
  clearCredentials,
  setAuthFromInitialization,
  setRefreshToken,
} from '../stores/slices/authSlice';
import { RootState } from '../stores/store';
import { AuthAPI } from '../stores/services/AuthApi';
import { OrganizerAPI } from '../stores/services/OrganizerApi';
import { EventAPI } from '../stores/services/EventApi';
import { CategoryAPI } from '../stores/services/CategoryApi';
import { VenueAPI } from '../stores/services/VenueApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // hook/useAuth.ts - Update login function
  const login = (accessToken: string, refreshToken: string, user: any, isInitialized: boolean = true) => {
    console.debug('Setting auth:', { accessToken, refreshToken, user });

    // Clear cache before new login
    dispatch(AuthAPI.util.resetApiState());
    dispatch(OrganizerAPI.util.resetApiState());
    dispatch(EventAPI.util.resetApiState());
    dispatch(CategoryAPI.util.resetApiState());
    dispatch(VenueAPI.util.resetApiState());

    dispatch(
      setCredentials({
        accessToken,
        refreshToken,
        user,
        isInitialized,
      }),
    );

    // Tokens are stored in httpOnly cookies by server-side API routes
    // No need to set cookies from client side
  };

  const setAuthFromInit = (
    accessToken: string | null,
    refreshToken: string | null,
    user: any | null,
  ) => {
    dispatch(setAuthFromInitialization({ accessToken, refreshToken, user }));
  };

  const setAuthToken = (token: string) => {
    dispatch(setToken(token));
  };

  const logout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all cache before logout
      dispatch(AuthAPI.util.resetApiState());
      dispatch(OrganizerAPI.util.resetApiState());
      dispatch(EventAPI.util.resetApiState());
      dispatch(CategoryAPI.util.resetApiState());
      dispatch(VenueAPI.util.resetApiState());

      dispatch(clearCredentials());
      // Cookies are cleared by the server-side logout API
      // No need to manually clear cookies from client side
    }
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
