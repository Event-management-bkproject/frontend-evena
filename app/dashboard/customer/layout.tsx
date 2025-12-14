// app/dashboard/(customer)/layout.tsx
'use client';

import RoleGuard from '@/src/components/RoleGuard';

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['USER']}>
      <main>{children}</main>
    </RoleGuard>
  );
}
