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
  const initialized = useRef(false);

  useEffect(() => {
    // Guard: run exactly once per page lifecycle.
    // IMPORTANT — do NOT add a cleanup that resets initialized.current.
    // React 18 Strict Mode runs effect → cleanup → effect again in dev.
    // If cleanup resets the ref, two concurrent refresh calls fire with the
    // same refresh token. The first call rotates the token; the second fails
    // (400) and calls setAuthFromInit(null) → user is logged out on every
    // page refresh. Keep initialized.current = true so the second effect
    // invocation sees it and returns early without a second fetch.
    if (initialized.current) return;
    initialized.current = true;

    // IMPORTANT — no isActive flag here.
    // This component lives in the root layout and never truly unmounts.
    // If we abandon the in-flight fetch via isActive=false (set in cleanup),
    // Strict Mode's cleanup fires before the response arrives → setAuthFromInit
    // is never called → auth stays uninitialized → infinite redirect loop.
    const initializeAuth = async () => {
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
        setAuthFromInit(null, null);
      }
    };

    initializeAuth();
    // No cleanup return — intentional. See comments above.
  }, []);

  return null;
}
