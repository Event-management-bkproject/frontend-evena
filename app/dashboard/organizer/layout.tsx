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

  // Hiển thị loading trong khi đang khởi tạo auth
  if (!auth.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Nếu không authenticated, hiển thị nothing (sẽ bị redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <main>{children}</main>;
}
