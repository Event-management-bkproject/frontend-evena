// app/login/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Box, Typography, Paper } from '@mui/material';
import Forms from '@/src/components/Forms';
import FormTextField from '@/src/components/FormTextField';
import FormButton from '@/src/components/FormButton';
import { loginValidationSchema } from '@/src/utils/validationSchema/loginValidationSchema';
import Image from 'next/image';
export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      console.log(res);

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Sai email hoặc mật khẩu!');
      }
    } catch (error) {
      console.error('Login error:', error);
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
              />

              <FormTextField
                id="login-password"
                name="password"
                label="Mật khẩu"
                type="password"
                required={true}
                placeholder="Nhập mật khẩu"
              />

              <FormButton
                isRegister={false}
                disabled={!formikProps.isValid || formikProps.isSubmitting}
                loginBtnLabelText={formikProps.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: 'primary.main',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                Chưa có tài khoản? Đăng ký:
                <Typography
                  sx={{
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => router.push('/register')}
                >
                  Customer
                </Typography>
                <Typography>Organization</Typography>
              </Typography>
            </>
          )}
        </Forms>
      </Paper>
    </Box>
  );
}
