/**
 * Organizer Registration Page
 * Allows new organizers to create an account
 * Redirects to email verification after successful registration
 */
'use client';

import { AuthLayout } from '@components/layout/AuthLayout';
import { RegisterForm } from '@components/auth/RegisterForm';

export default function OrganizerRegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm type="organizer" />
    </AuthLayout>
  );
}
