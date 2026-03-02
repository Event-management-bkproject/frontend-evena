'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useSnackbar } from '@/src/hooks/ui/useSnackbar';
import { logger } from '@utils/logger';
import { useLoginMutation } from '@/src/stores/services/AuthApi';
import { LoginRequest, parseApiError } from '@/src/stores/types';

/**
 * Custom hook for handling login logic using RTK Query
 * @returns {login, isLoading, error}
 * @example
 * const { login, isLoading } = useLogin();
 * await login({ email, password });
 */
export function useLogin() {
  const [loginMutation, { isLoading, error: apiError }] = useLoginMutation();
  const { login: setAuthState } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await loginMutation(credentials).unwrap();

      if (response.success && response.data) {
        const { accessToken, user } = response.data;
        // const { refreshToken } = response.data; // COMMENTED OUT: Backend refresh token not implemented yet

        // Set auth state in Redux with accessToken only
        setAuthState(accessToken, user, true);

        logger.debug('Login successful for user:', user.email);
        showSnackbar('Login successful!', 'success');

        // Check if there's a redirect URL from query params
        const redirectUrl = searchParams.get('redirect');

        if (redirectUrl) {
          // Replace login page in history so back button doesn't return to login
          router.replace(redirectUrl);
        } else {
          // Redirect based on role
          let redirectPath;
          if (user.roles.includes('ADMIN')) {
            redirectPath = '/dashboard/admin';
          } else if (user.roles.includes('ORGANIZER')) {
            redirectPath = '/dashboard/organizer';
          } else if (user.roles.includes('USER')) {
            // USER role = customer
            redirectPath = '/dashboard/customer';
          } else {
            // Default fallback for unknown roles
            redirectPath = '/dashboard/customer';
          }
          router.replace(redirectPath);
        }

        return true;
      }

      showSnackbar(response.message || 'Login failed', 'error');
      return false;
    } catch (err: unknown) {
      const apiError = parseApiError(err);
      showSnackbar(apiError.message, 'error');
      logger.error('Login error:', apiError);
      return false;
    }
  };

  return {
    login,
    isLoading,
    error: apiError,
  };
}
