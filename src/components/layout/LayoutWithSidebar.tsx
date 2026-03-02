// components/Layout/LayoutWithSidebar.tsx
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white', gap: '10px', p: '10px' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage={currentPage} />

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)', overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
