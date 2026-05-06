// hook/useAuth.ts
'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  setCredentials,
  clearCredentials,
  setAuthFromInitialization,
} from '@/src/stores/slices/authSlice';
import { RootState } from '@/src/stores/store';
import { UserResponse } from '@/src/stores/types/auth';
import { AuthAPI } from '@/src/stores/services/AuthApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

const resetAllApiCaches = (dispatch: ReturnType<typeof useDispatch>) => {
  dispatch(AuthAPI.util.resetApiState());
  dispatch(OrganizerAPI.util.resetApiState());
  dispatch(EventAPI.util.resetApiState());
  dispatch(CategoryAPI.util.resetApiState());
  dispatch(VenueAPI.util.resetApiState());
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // Security: accessToken stored in memory only (not persisted).
  // Refresh token stored in httpOnly cookie by backend.
  const login = (accessToken: string, user: UserResponse, isInitialized = true) => {
    // Clear stale logout flag: if the user logged out then re-logged in without
    // reloading the page, the flag would still be in sessionStorage. A subsequent
    // reload would cause AuthInitializer to skip /auth/refresh and force logout.
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('__evena_logout');
    }
    dispatch(setCredentials({ accessToken, user, isInitialized }));
    // Clear stale RTK cache AFTER credentials are set so that any in-flight
    // queries triggered by the new auth state start from a clean slate,
    // not before (which would clear data that components need mid-render).
    resetAllApiCaches(dispatch);
  };

  // Called by AuthInitializer on app boot to restore session from httpOnly cookie.
  const setAuthFromInit = (accessToken: string | null, user: UserResponse | null) => {
    dispatch(setAuthFromInitialization({ accessToken, user }));
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Logout should proceed even if the API call fails (e.g. expired token)
    }

    // Guard against re-login after page reload: if the backend does not clear
    // the httpOnly refreshToken cookie (e.g. network error, misconfiguration),
    // AuthInitializer would call /auth/refresh on the next boot and succeed.
    // Setting this flag tells AuthInitializer to skip refresh and stay logged out.
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('__evena_logout', '1');
    }

    resetAllApiCaches(dispatch);
    dispatch(clearCredentials());
  };

  return {
    auth,
    login,
    logout,
    setAuthFromInit,
    isAuthenticated: !!auth.accessToken,
  };
};
