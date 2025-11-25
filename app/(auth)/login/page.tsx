// app/login/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Paper } from '@mui/material';
import Forms from '@/src/components/Forms';
import FormTextField from '@/src/components/FormTextField';
import FormButton from '@/src/components/FormButton';
import { loginValidationSchema } from '@/src/utils/validationSchema/loginValidationSchema';
import Image from 'next/image';
import { useAuth } from '@/src/hook/useAuth';
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        // Set token vào Redux store
        login(data.accessToken, data.user, true);
      }

      if (res.ok) {
        if (data.user.roles.includes('ORGANIZER')) {
          router.push('/dashboard/organizer');
          return;
        }
        router.push('/dashboard');
      } else {
        alert('Sai email hoặc mật khẩu!');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi đăng nhập!');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EEF0FF 0%, #FCD3FF 100%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#EEF0FF',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Image src="/logo.svg" alt="Evena Logo" width={150} height={50} priority />
        </Box>

        <Forms
          values={{ email: '', password: '' }}
          validationSchema={loginValidationSchema}
          onSubmit={handleSubmit}
          keyValue="login-form"
          isRegister={false}
        >
          {(formikProps) => (
            <>
              <FormTextField
                id="login-email"
                name="email"
                label="Email"
                type="email"
                required={true}
                placeholder="Nhập email của bạn"
                autoComplete="email"
              />

              <FormTextField
                id="login-password"
                name="password"
                label="Mật khẩu"
                type="password"
                required={true}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />

              <FormButton
                isRegister={false}
                disabled={!formikProps.isValid || formikProps.isSubmitting}
                loginBtnLabelText={formikProps.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              />
              <Box
                sx={{
                  mt: 2,
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="body2" component="span" sx={{ color: 'primary.main' }}>
                  Chưa có tài khoản? Đăng ký:
                </Typography>

                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push('/register')}
                >
                  Customer
                </Typography>

                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push('/register/organizer')}
                >
                  Organization
                </Typography>
              </Box>
            </>
          )}
        </Forms>
      </Paper>
    </Box>
  );
}
