'use client';

import { Box, Typography } from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import Forms from '@components/Forms';
import FormTextField from '@components/FormTextField';
import FormButton from '@components/FormButton';
import { AuthLink } from '@components/common/AuthLink';
import { loginValidationSchema } from '@utils/validationSchema/loginValidationSchema';
import { useLogin } from '@/src/hooks/auth/useLogin';
import { LoginFormProps } from './types';

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login form component with validation and submission logic
 */
export function LoginForm({ onSubmitSuccess }: LoginFormProps) {
  const { t } = useTranslation();
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
            label={t('common.labels.email')}
            type="email"
            required={true}
            placeholder={t('auth.placeholders.enterEmail')}
            autoComplete="username"
          />

          <FormTextField
            id="login-password"
            name="password"
            label={t('common.labels.password')}
            type="password"
            required={true}
            placeholder={t('auth.placeholders.enterPassword')}
            autoComplete="new-password"
          />

          <FormButton
            isRegister={false}
            disabled={!formikProps.isValid || formikProps.isSubmitting || isLoading}
            loginBtnLabelText={formikProps.isSubmitting || isLoading ? t('auth.login.loggingIn') : t('auth.login.title')}
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
              {t('auth.login.dontHaveAccount')}
            </Typography>

            <AuthLink href="/register">{t('auth.login.customer')}</AuthLink>
            <AuthLink href="/register/organizer">{t('auth.login.organization')}</AuthLink>
          </Box>
        </>
      )}
    </Forms>
  );
}

export default LoginForm;
