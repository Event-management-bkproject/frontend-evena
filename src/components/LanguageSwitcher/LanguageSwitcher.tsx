'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Radio,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  open: boolean;
  onClose: () => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export function LanguageSwitcher({ open, onClose }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
    // Close modal after a short delay to show selection feedback
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#36437C' }}>
          {t('language.title')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#36437C' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('language.current')}: <strong>{languages.find((lang) => lang.code === selectedLanguage)?.nativeName}</strong>
          </Typography>
        </Box>

        <List sx={{ pt: 0 }}>
          {languages.map((language) => (
            <ListItem key={language.code} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleLanguageChange(language.code)}
                selected={selectedLanguage === language.code}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    backgroundColor: '#F0E6FF',
                    '&:hover': {
                      backgroundColor: '#E6D9FF',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#F7F7F7',
                  },
                }}
              >
                <ListItemIcon>
                  <Radio
                    checked={selectedLanguage === language.code}
                    sx={{
                      color: '#36437C',
                      '&.Mui-checked': {
                        color: '#F36BF9',
                      },
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={language.nativeName}
                  secondary={language.name}
                  primaryTypographyProps={{
                    fontWeight: selectedLanguage === language.code ? 600 : 400,
                    color: selectedLanguage === language.code ? '#36437C' : 'text.primary',
                  }}
                  secondaryTypographyProps={{
                    color: 'text.secondary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#F7F7F7', borderRadius: '12px' }}>
          <Typography variant="caption" color="text.secondary">
            💡 {t('language.select')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LanguageSwitcher;
