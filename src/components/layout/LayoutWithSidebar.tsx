// components/Layout/LayoutWithSidebar.tsx
'use client';

import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '../Sidebar/Sidebar'; // ← ĐẢM BẢO ĐÂY LÀ SIDEBAR, KHÔNG PHẢI ORGANIZATIONCARD

interface LayoutWithSidebarProps {
  children: React.ReactNode;
  title?: string;
  currentPage?: string;
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children, title = 'Dashboard', currentPage = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* ĐẢM BẢO ĐÂY LÀ SIDEBAR COMPONENT */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage={currentPage} />

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="h1" fontWeight="bold" noWrap>
              {title}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
