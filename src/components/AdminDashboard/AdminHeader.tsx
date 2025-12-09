import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

interface AdminHeaderProps {
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="#2A3363" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage categories and venues for the platform
        </Typography>
      </Box>

      <Box>
        <Button
          onClick={onLogout}
          startIcon={<LogoutIcon />}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            color: '#36437C',
            borderColor: '#C5CBDC',
            '&:hover': { backgroundColor: '#F3F4F8' },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};
