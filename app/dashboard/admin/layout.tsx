'use client';

import RoleGuard from '@/src/components/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <main>{children}</main>
    </RoleGuard>
  );
}
