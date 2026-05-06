// components/AuthInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

export default function AuthInitializer() {
  const { setAuthFromInit } = useAuth();
  const dispatch = useDispatch();
  // Ref guard ensures this runs exactly once per page mount. Unlike putting
  // auth.isInitialized in the effect deps, this approach never re-runs after
  // login/logout — those actions only change Redux state, not the page lifecycle.
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let isActive = true;

    const initializeAuth = async () => {
      // Defensive guard: if the user explicitly logged out last session, skip
      // the refresh call even if the httpOnly cookie is still present (e.g.
      // backend failed to clear it). Flag is set by useAuth.logout() and
      // cleared here on read — or by useAuth.login() on successful re-login.
      if (typeof window !== 'undefined' && sessionStorage.getItem('__evena_logout')) {
        sessionStorage.removeItem('__evena_logout');
        setAuthFromInit(null, null);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!isActive) return;

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAuthFromInit(data.data.accessToken, data.data.user);
            return;
          }
        }

        setAuthFromInit(null, null);
        dispatch(OrganizerAPI.util.resetApiState());
        dispatch(EventAPI.util.resetApiState());
        dispatch(CategoryAPI.util.resetApiState());
        dispatch(VenueAPI.util.resetApiState());
      } catch {
        if (!isActive) return;
        setAuthFromInit(null, null);
      }
    };

    initializeAuth();

    return () => {
      isActive = false;
      // Reset so React Strict Mode's cleanup+remount cycle can re-run the effect.
      // In production AuthInitializer never unmounts (root layout), so this only
      // matters in development double-invoke mode.
      initialized.current = false;
    };
  }, []); // empty deps: tied to page mount, not to auth state changes

  return null;
}
