// app/dashboard/organizer/layout.tsx
'use client';

import RoleGuard from '@/src/components/RoleGuard';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ORGANIZER']}>
      <main>{children}</main>
    </RoleGuard>
  );
}
