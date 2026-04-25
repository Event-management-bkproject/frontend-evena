'use client';

import { Box, Typography, Button, Divider } from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import Forms from '@components/Forms';
import FormTextField from '@components/FormTextField';
import { AuthLink } from '@components/common/AuthLink';
import { loginValidationSchema } from '@utils/validationSchema/loginValidationSchema';
import { useLogin } from '@/src/hooks/auth/useLogin';
import { LoginFormProps } from './types';

interface LoginFormValues {
  email: string;
  password: string;
}

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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 22, sm: 26 }, letterSpacing: '-0.5px', mb: 0.75 }}
        >
          {t('auth.login.welcomeBack')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: 14 }}>
          {t('auth.login.subtitle')}
        </Typography>
      </Box>

      <Forms
        values={{ email: '', password: '' }}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
        keyValue="login-form"
        isRegister={false}
      >
        {(formikProps: FormikProps<LoginFormValues>) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormTextField
              id="login-email"
              name="email"
              label={t('common.labels.email')}
              type="email"
              required
              placeholder={t('auth.placeholders.enterEmail')}
              autoComplete="username"
            />

            <FormTextField
              id="login-password"
              name="password"
              label={t('common.labels.password')}
              type="password"
              required
              placeholder={t('auth.placeholders.enterPassword')}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              disabled={!formikProps.isValid || formikProps.isSubmitting || isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: 15,
                fontWeight: 700,
                borderRadius: '10px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #F36BF9 0%, #6093FC 100%)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e055e8 0%, #4a7ef0 100%)',
                  boxShadow: '0 6px 18px rgba(96,147,252,0.45)',
                },
                '&:disabled': {
                  background: '#E2E8F0',
                  color: '#94A3B8',
                  boxShadow: 'none',
                },
              }}
            >
              {formikProps.isSubmitting || isLoading
                ? t('auth.login.loggingIn')
                : t('auth.login.title')}
            </Button>

            <Divider sx={{ my: 2.5, borderColor: '#E2E8F0' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', px: 1 }}>
                {t('auth.login.or')}
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                {t('auth.login.dontHaveAccount')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <AuthLink href="/register">{t('auth.login.customer')}</AuthLink>
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>|</Typography>
                <AuthLink href="/register/organizer">{t('auth.login.organization')}</AuthLink>
              </Box>
            </Box>
          </Box>
        )}
      </Forms>
    </Box>
  );
}

export default LoginForm;
