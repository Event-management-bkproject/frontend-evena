'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hook/useAuth';
import { useSnackbar } from '@hooks/useSnackbar';
import { logger } from '@utils/logger';
import { useLoginMutation } from '@/src/stores/services/AuthApi';
import { LoginRequest } from '@/src/stores/types';

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
  const { showSnackbar } = useSnackbar();

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await loginMutation(credentials).unwrap();

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Set auth state in Redux with both tokens
        setAuthState(accessToken, refreshToken, user, true);

        logger.debug('Login successful for user:', user.email);
        showSnackbar('Login successful!', 'success');

        // Redirect based on role
        const redirectPath = user.roles.includes('ORGANIZER') ? '/dashboard/organizer' : '/dashboard';

        router.push(redirectPath);
        return true;
      }

      showSnackbar(response.message || 'Login failed', 'error');
      return false;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Invalid email or password';
      showSnackbar(errorMessage, 'error');
      logger.error('Login error:', err);
      return false;
    }
  };

  return {
    login,
    isLoading,
    error: apiError,
  };
}
