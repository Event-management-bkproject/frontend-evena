// components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

export default function AuthInitializer() {
  const { setAuthFromInit, auth } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Closure-scoped flag — unique per effect run. Unlike a shared ref,
    // the cleanup for THIS run sets its own `isActive = false` without
    // affecting the flag of the next run. This prevents a stale
    // /auth/refresh response (which may return 401 for a user who had
    // no prior session) from wiping credentials set by a concurrent login.
    let isActive = true;

    const initializeAuth = async () => {
      if (auth.isInitialized) return;

      try {
        // Always attempt refresh — httpOnly cookie is sent automatically.
        // Do not gate on persisted user: cookie is the source of truth.
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

        // Refresh failed — unauthenticated
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
    };
  }, [auth.isInitialized]);

  return null;
}
