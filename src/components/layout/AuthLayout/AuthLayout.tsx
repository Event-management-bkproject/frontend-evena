'use client';

import { Box, Paper } from '@mui/material';
import Image from 'next/image';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@utils/constants/theme';
import { AuthLayoutProps } from './types';

/**
 * Reusable layout component for authentication pages (login, register, etc.)
 * Provides consistent styling with centered paper container and logo
 */
export function AuthLayout({ children, maxWidth = 400 }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: COLORS.background.gradient,
      }}
    >
      <Paper
        elevation={SHADOWS.heavy}
        sx={{
          p: SPACING.xl,
          borderRadius: BORDER_RADIUS.md,
          backgroundColor: COLORS.background.paper,
          maxWidth,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: SPACING.lg }}>
          <Image src="/logoOrg.svg" alt="Evena Logo" width={150} height={50} priority />
        </Box>

        {children}
      </Paper>
    </Box>
  );
}

export default AuthLayout;
