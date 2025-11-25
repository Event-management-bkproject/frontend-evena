// app/register/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Box, Typography, Paper } from '@mui/material';
import Forms from '@/src/components/Forms';
import FormTextField from '@/src/components/FormTextField';
import FormButton from '@/src/components/FormButton';
import { registerValidationSchema } from '@/src/utils/validationSchema/registerValidationSchema'; // Bạn cần tạo file này
import Image from 'next/image';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';

export default function CustomerRegisterPage() {
  const router = useRouter();

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/verify-email/check-email?email=${encodeURIComponent(values.email)}`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi đăng ký!');
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
          values={{
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={registerValidationSchema}
          onSubmit={handleSubmit}
          keyValue="register-form"
          isRegister={true}
        >
          {(formikProps) => (
            <>
              <FormTextField
                id="register-name"
                name="name"
                label="Họ và tên"
                type="text"
                required={true}
                placeholder="Nhập họ và tên của bạn"
              />

              <FormTextField
                id="register-email"
                name="email"
                label="Email"
                type="email"
                required={true}
                placeholder="Nhập email của bạn"
              />

              <FormTextField
                id="register-phone"
                name="phone"
                label="Số điện thoại"
                type="text"
                required={true}
                placeholder="Nhập số điện thoại"
              />

              <FormTextField
                id="register-password"
                name="password"
                label="Mật khẩu"
                type="password"
                required={true}
                placeholder="Nhập mật khẩu"
              />

              <FormTextField
                id="register-confirmPassword"
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                required={true}
                placeholder="Nhập lại mật khẩu"
              />

              <FormButton
                isRegister={true}
                disabled={!formikProps.isValid || formikProps.isSubmitting}
                registerBtnLabelText={formikProps.isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
              />

              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => router.push('/login')}
              >
                Đã có tài khoản? Đăng nhập ngay
              </Typography>
            </>
          )}
        </Forms>
      </Paper>
    </Box>
  );
}
