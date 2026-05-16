'use client';

import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
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
        {/* Mobile-only hamburger — opens the sidebar drawer */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: '8px' }}>
          <IconButton
            onClick={() => setSidebarOpen(true)}
            size="small"
            sx={{
              bgcolor: '#E4E6F5',
              borderRadius: '10px',
              p: '8px',
              '&:hover': { bgcolor: '#CDD0E8' },
            }}
          >
            <MenuIcon sx={{ color: '#2A3363', fontSize: 20 }} />
          </IconButton>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
