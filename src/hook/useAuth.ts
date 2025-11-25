// hook/useAuth.ts
'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setToken, setCredentials, clearCredentials, setAuthFromInitialization } from '../stores/slices/authSlice';
import { RootState } from '../stores/store';
import { OrganizerAPI } from '../stores/services/OrganizerApi';
import { EventAPI } from '../stores/services/EventApi';
import { CategoryAPI } from '../stores/services/CategoryApi';
import { VenueAPI } from '../stores/services/VenueApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = (accessToken: string, user: any, isInitialized: boolean = true) => {
    console.debug('accessToken', accessToken, 'user', user);
    // Clear cache trước khi login mới
    dispatch(OrganizerAPI.util.resetApiState());
    dispatch(EventAPI.util.resetApiState());
    dispatch(CategoryAPI.util.resetApiState());
    dispatch(VenueAPI.util.resetApiState());

    dispatch(
      setCredentials({
        accessToken,
        user,
        isInitialized, // Thêm property này
      }),
    );
  };

  const setAuthFromInit = (accessToken: string | null, user: any | null) => {
    dispatch(setAuthFromInitialization({ accessToken, user }));
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
      // Clear tất cả cache trước khi logout
      dispatch(OrganizerAPI.util.resetApiState());
      dispatch(EventAPI.util.resetApiState());
      dispatch(CategoryAPI.util.resetApiState());
      dispatch(VenueAPI.util.resetApiState());

      dispatch(clearCredentials());
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
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
