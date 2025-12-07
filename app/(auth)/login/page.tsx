/**
 * Login Page
 * Provides user authentication with email and password
 * Redirects to dashboard based on user role (Customer/Organizer)
 */
'use client';

import { AuthLayout } from '@components/layout/AuthLayout';
import { LoginForm } from '@components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
