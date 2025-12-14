'use client';

import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/src/hooks/ui/useSnackbar';
import { logger } from '@utils/logger';
import { useRegisterMutation, useRegisterOrganizerMutation } from '@/src/stores/services/AuthApi';
import { RegisterRequest, RegisterType } from '@/src/stores/types';

/**
 * Custom hook for handling registration logic using RTK Query
 * Supports both customer and organizer registration
 * @param type - 'customer' or 'organizer'
 * @returns {register, isLoading, error}
 */
export function useRegister({ type }: RegisterType) {
  const [registerCustomer, { isLoading: isLoadingCustomer, error: customerError }] = useRegisterMutation();
  const [registerOrganizer, { isLoading: isLoadingOrganizer, error: organizerError }] =
    useRegisterOrganizerMutation();

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const isLoading = type === 'customer' ? isLoadingCustomer : isLoadingOrganizer;
  const error = type === 'customer' ? customerError : organizerError;

  const register = async (credentials: RegisterRequest): Promise<boolean> => {
    try {
      const mutation = type === 'customer' ? registerCustomer : registerOrganizer;
      const response = await mutation(credentials).unwrap();

      if (response.success && response.data) {
        logger.debug(`Registration successful for ${type}:`, credentials.email);
        showSnackbar('Registration successful! Please check your email.', 'success');

        // Redirect to email verification page
        router.push(`/verify-email/check-email?email=${encodeURIComponent(credentials.email)}`);
        return true;
      }

      showSnackbar(response.message || 'Registration failed', 'error');
      return false;
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'An error occurred during registration. Please try again.';
      showSnackbar(errorMessage, 'error');
      logger.error('Registration error:', err);
      return false;
    }
  };

  return {
    register,
    isLoading,
    error,
  };
}
