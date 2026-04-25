'use client';

import { Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthLinkProps } from './types';

/**
 * Reusable clickable link component for authentication pages
 * @param href - The navigation path
 * @param children - The text to display
 */
export function AuthLink({ href, children }: AuthLinkProps) {
  const router = useRouter();

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        background: 'linear-gradient(90deg, #F36BF9, #6093FC)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        cursor: 'pointer',
        fontWeight: 600,
        '&:hover': {
          opacity: 0.8,
        },
      }}
      onClick={() => router.push(href)}
    >
      {children}
    </Typography>
  );
}

export default AuthLink;
