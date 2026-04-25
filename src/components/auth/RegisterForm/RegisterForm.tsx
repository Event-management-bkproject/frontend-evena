'use client';

import { Box, Typography, Button, Divider } from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import Forms from '@components/Forms';
import FormTextField from '@components/FormTextField';
import { AuthLink } from '@components/common/AuthLink';
import { registerValidationSchema } from '@utils/validationSchema/registerValidationSchema';
import { useRegister } from '@/src/hooks/auth/useRegister';
import { RegisterFormProps } from './types';

export function RegisterForm({ type, onSubmitSuccess }: RegisterFormProps) {
  const { t } = useTranslation();
  const { register, isLoading } = useRegister({ type });

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    const success = await register(values);
    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const isOrganizer = type === 'organizer';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 20, sm: 24 }, letterSpacing: '-0.5px', mb: 0.75 }}
        >
          {isOrganizer
            ? t('auth.register.organizerTitle')
            : t('auth.register.customerTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: 14 }}>
          {isOrganizer
            ? t('auth.register.organizerSubtitle')
            : t('auth.register.customerSubtitle')}
        </Typography>
      </Box>

      <Forms
        values={{ name: '', email: '', phone: '', password: '', confirmPassword: '' }}
        validationSchema={registerValidationSchema}
        onSubmit={handleSubmit}
        keyValue={`${type}-register-form`}
        isRegister
      >
        {(formikProps: FormikProps<any>) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormTextField
              id={`${type}-register-name`}
              name="name"
              label={t('common.labels.fullName')}
              type="text"
              required
              placeholder={t('auth.placeholders.enterFullName')}
              autoComplete="name"
            />

            <FormTextField
              id={`${type}-register-email`}
              name="email"
              label={t('common.labels.email')}
              type="email"
              required
              placeholder={t('auth.placeholders.enterEmail')}
              autoComplete="email"
            />

            <FormTextField
              id={`${type}-register-phone`}
              name="phone"
              label={t('common.labels.phoneNumber')}
              type="tel"
              required
              placeholder={t('auth.placeholders.enterPhoneNumber')}
              autoComplete="tel"
            />

            <FormTextField
              id={`${type}-register-password`}
              name="password"
              label={t('common.labels.password')}
              type="password"
              required
              placeholder={t('auth.placeholders.enterPassword')}
              autoComplete="new-password"
            />

            <FormTextField
              id={`${type}-register-confirmPassword`}
              name="confirmPassword"
              label={t('common.labels.confirmPassword')}
              type="password"
              required
              placeholder={t('auth.placeholders.reEnterPassword')}
              autoComplete="new-password"
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
                ? t('auth.register.registering')
                : t('common.buttons.register')}
            </Button>

            <Divider sx={{ my: 2.5, borderColor: '#E2E8F0' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', px: 1 }}>
                {t('auth.login.or')}
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                {t('auth.register.alreadyHaveAccount')}
              </Typography>
              <AuthLink href="/login">{t('auth.register.loginHere')}</AuthLink>
            </Box>
          </Box>
        )}
      </Forms>
    </Box>
  );
}

export default RegisterForm;
