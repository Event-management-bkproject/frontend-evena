'use client';

import ProtectedContent from '@/src/components/ProtectedContent';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import ProfilePage from '@/src/components/ProfilePage/ProfilePage';

export default function AdminProfilePage() {
  return (
    <ProtectedContent>
      <AdminLayout>
        <AdminPageShell
          title="Profile"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Profile' }]}
        >
          <ProfilePage />
        </AdminPageShell>
      </AdminLayout>
    </ProtectedContent>
  );
}
