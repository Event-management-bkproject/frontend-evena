// app/organizers-test/layout.tsx
'use client';

import { useAuth } from '@/src/hook/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrganizersTestLayout({ children }: { children: React.ReactNode }) {
  const { auth, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã initialized và không có authentication, redirect về login
    if (auth.isInitialized && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent('/dashboard')}`;
      router.push(redirectUrl);
    }
  }, [auth.isInitialized, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Auth initialization is handled by AuthInitializer component globally
  // No need for separate loading UI here

  // Nếu không authenticated, hiển thị nothing (sẽ bị redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <main>{children}</main>;
}
