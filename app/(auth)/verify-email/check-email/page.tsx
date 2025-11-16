// app/verify-email/check-email/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Paper, Button } from '@mui/material';
import Image from 'next/image';

export default function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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
          <Image src="/logo.svg" alt="Evena Logo" width={150} height={50} priority />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#37437D' }}>
          Kiểm Tra Email
        </Typography>

        <Typography variant="body1" sx={{ color: '#37437D', mb: 3, lineHeight: 1.6 }}>
          Chúng tôi đã gửi liên kết xác thực đến:
          <br />
          <strong>{email || 'email của bạn'}</strong>
        </Typography>

        <Typography variant="body2" sx={{ color: '#666', mb: 4, lineHeight: 1.6 }}>
          Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để kích hoạt tài khoản.
          <br />
          Nếu không thấy email, hãy kiểm tra thư mục spam.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/register')}
            sx={{
              borderColor: '#37437D',
              color: '#37437D',
              '&:hover': { backgroundColor: '#37437D', color: 'white' },
              px: 3,
            }}
          >
            Quay lại Đăng ký
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            sx={{
              backgroundColor: '#37437D',
              '&:hover': { backgroundColor: '#2a3361' },
              px: 3,
            }}
          >
            Đến trang Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
