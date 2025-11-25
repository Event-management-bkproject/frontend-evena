// components/ProtectedContent.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/hook/useAuth';
import { useDispatch } from 'react-redux';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';

interface ProtectedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedContent({ children, fallback = <div>Loading...</div> }: ProtectedContentProps) {
  const { auth } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Khi auth thay đổi, invalidate cache của organizers
    if (auth.isInitialized) {
      dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
    }
  }, [auth.isInitialized, auth.accessToken, dispatch]);

  // Chỉ render children khi auth đã được initialized
  if (!auth.isInitialized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
