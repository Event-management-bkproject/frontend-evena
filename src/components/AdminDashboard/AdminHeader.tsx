'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Logout as LogoutIcon, Settings } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';

interface AdminHeaderProps {
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [languageSwitcherOpen, setLanguageSwitcherOpen] = useState(false);

  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="#2A3363" gutterBottom>
          {t('common.navigation.dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Settings Button for Language */}
        <IconButton
          onClick={() => setLanguageSwitcherOpen(true)}
          size="medium"
          sx={{
            borderRadius: '8px',
            color: '#36437C',
            border: '1px solid #C5CBDC',
            '&:hover': {
              backgroundColor: '#F3F4F8',
            },
          }}
        >
          <Settings />
        </IconButton>

        {/* Logout Button */}
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
          {t('common.buttons.logout')}
        </Button>
      </Box>

      {/* Language Switcher Modal */}
      <LanguageSwitcher open={languageSwitcherOpen} onClose={() => setLanguageSwitcherOpen(false)} />
    </Box>
  );
};
