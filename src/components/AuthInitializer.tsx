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
  const { setAuthFromInit, auth } = useAuth();
  const dispatch = useDispatch();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

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

        if (!isMountedRef.current) return;

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
        if (!isMountedRef.current) return;
        setAuthFromInit(null, null);
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, [auth.isInitialized]);

  return null;
}
