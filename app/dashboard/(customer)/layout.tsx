// app/dashboard/(customer)/layout.tsx
'use client';

import { useAuth } from '@/src/hook/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthLoadingScreen from '@/src/components/AuthLoadingScreen';

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { auth, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If initialized and not authenticated, redirect to login
    if (auth.isInitialized && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent('/dashboard')}`;
      router.push(redirectUrl);
    }
  }, [auth.isInitialized, isAuthenticated, router]);

  // Show loading while initializing auth
  if (!auth.isInitialized) {
    return <AuthLoadingScreen />;
  }

  // If not authenticated, show nothing (will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  return <main>{children}</main>;
}
