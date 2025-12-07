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
        color: 'primary.main',
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
      onClick={() => router.push(href)}
    >
      {children}
    </Typography>
  );
}

export default AuthLink;
