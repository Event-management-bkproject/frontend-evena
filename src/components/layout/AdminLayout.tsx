'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { ADMIN } from '@/src/utils/constants/adminBrand';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: ADMIN.pageBg,
        gap: '10px',
        p: '10px',
      }}
    >
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 20px)',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
