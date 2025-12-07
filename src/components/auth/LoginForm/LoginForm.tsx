'use client';

import { Box, Typography } from '@mui/material';
import { FormikProps } from 'formik';
import Forms from '@components/Forms';
import FormTextField from '@components/FormTextField';
import FormButton from '@components/FormButton';
import { AuthLink } from '@components/common/AuthLink';
import { loginValidationSchema } from '@utils/validationSchema/loginValidationSchema';
import { useLogin } from '@hooks/useLogin';
import { LoginFormProps } from './types';

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login form component with validation and submission logic
 */
export function LoginForm({ onSubmitSuccess }: LoginFormProps) {
  const { login, isLoading } = useLogin();

  const handleSubmit = async (values: LoginFormValues) => {
    const success = await login(values);
    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <Forms
      values={{ email: '', password: '' }}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
      keyValue="login-form"
      isRegister={false}
    >
      {(formikProps: FormikProps<LoginFormValues>) => (
        <>
          <FormTextField
            id="login-email"
            name="email"
            label="Email"
            type="email"
            required={true}
            placeholder="Enter your email"
            autoComplete="username"
          />

          <FormTextField
            id="login-password"
            name="password"
            label="Password"
            type="password"
            required={true}
            placeholder="Enter your password"
            autoComplete="new-password"
          />

          <FormButton
            isRegister={false}
            disabled={!formikProps.isValid || formikProps.isSubmitting || isLoading}
            loginBtnLabelText={formikProps.isSubmitting || isLoading ? 'Logging in...' : 'Login'}
          />

          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1.25,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2" component="span" sx={{ color: 'primary.main' }}>
              Don&apos;t have an account? Register as:
            </Typography>

            <AuthLink href="/register">Customer</AuthLink>
            <AuthLink href="/register/organizer">Organization</AuthLink>
          </Box>
        </>
      )}
    </Forms>
  );
}

export default LoginForm;
