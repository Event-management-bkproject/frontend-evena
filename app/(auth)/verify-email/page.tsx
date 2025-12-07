// app/verify-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Liên kết xác thực không hợp lệ');
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Xác thực email thành công!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Xác thực email thất bại');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác thực email');
      }
    };

    verifyEmail();
  }, [token]);

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
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Image src="/logoOrg.svg" alt="Evena Logo" width={150} height={50} priority />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#37437D' }}>
          Xác Thực Email
        </Typography>

        {status === 'loading' && (
          <Box sx={{ my: 4 }}>
            <CircularProgress size={60} sx={{ color: '#37437D', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#37437D' }}>
              Đang xác thực email của bạn...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ my: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" sx={{ color: '#37437D', mb: 3 }}>
              Email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập vào tài khoản.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#37437D',
                '&:hover': { backgroundColor: '#2a3361' },
                px: 4,
                py: 1.5,
              }}
            >
              Đăng Nhập
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ my: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" sx={{ color: '#37437D', mb: 3 }}>
              Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/register')}
              sx={{
                borderColor: '#37437D',
                color: '#37437D',
                '&:hover': { backgroundColor: '#37437D', color: 'white' },
                px: 4,
                py: 1.5,
                mr: 2,
              }}
            >
              Đăng Ký Lại
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#37437D',
                '&:hover': { backgroundColor: '#2a3361' },
                px: 4,
                py: 1.5,
              }}
            >
              Đăng Nhập
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
