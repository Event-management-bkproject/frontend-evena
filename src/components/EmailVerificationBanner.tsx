'use client';

import React, { useState } from 'react';
import { Alert, AlertTitle, Button, Box, CircularProgress } from '@mui/material';
import { Email, CheckCircle, Warning } from '@mui/icons-material';
import { useAppSelector } from '@/src/stores/hooks';

/**
 * Email Verification Banner Component
 * Displays a banner when user's email is not verified
 * Allows user to resend verification email
 */
export function EmailVerificationBanner() {
  const user = useAppSelector((state) => state.auth.user);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Don't show banner if user is not logged in or email is already verified
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend verification email API endpoint
      // const response = await fetch(`http://localhost:8080/api/auth/resend-verification?email=${user.email}`, {
      //   method: 'POST',
      // });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (resendSuccess) {
    return (
      <Alert
        severity="success"
        icon={<CheckCircle />}
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>Verification Email Sent!</AlertTitle>
        Please check your email inbox ({user.email}) for the verification link.
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      icon={<Warning />}
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            size="small"
            onClick={handleResendEmail}
            disabled={isResending}
            startIcon={isResending ? <CircularProgress size={16} /> : <Email />}
            sx={{
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'warning.dark',
                color: 'white',
              },
            }}
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
        </Box>
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>Email Not Verified</AlertTitle>
      Your email address <strong>{user.email}</strong> has not been verified. Please check your inbox and click
      the verification link.
    </Alert>
  );
}

export default EmailVerificationBanner;
