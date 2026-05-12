'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
interface LayoutWithSidebarProps {
  children: React.ReactNode;
  currentPage?: string;
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children, currentPage = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        gap: '10px',
        p: '10px',
      }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage={currentPage} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 20px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
