/**
 * Customer Registration Page
 * Allows new customers to create an account
 * Redirects to email verification after successful registration
 */
'use client';

import { AuthLayout } from '@components/layout/AuthLayout';
import { RegisterForm } from '@components/auth/RegisterForm';

export default function CustomerRegisterPage() {
  return (
    <AuthLayout maxWidth={520}>
      <RegisterForm type="customer" />
    </AuthLayout>
  );
}
