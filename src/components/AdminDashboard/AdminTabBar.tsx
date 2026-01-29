import React from 'react';
import { Box, Button, TextField, Paper } from '@mui/material';
import { Add as AddIcon, Category as CategoryIcon, Place as PlaceIcon, Search as SearchIcon, Business as BusinessIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AdminTabBarProps {
  activeTab: number;
  searchTerm: string;
  onTabChange: (tab: number) => void;
  onSearchChange: (value: string) => void;
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
  activeTab,
  searchTerm,
  onTabChange,
  onSearchChange,
  onAddClick,
  showAddButton = true,
}) => {
  const { t } = useTranslation();

  const getTabLabel = () => {
    switch (activeTab) {
      case 0: return t('common.entities.category');
      case 1: return t('common.entities.venue');
      case 2: return t('common.entities.organization');
      default: return '';
    }
  };

  return (
    <Paper sx={{ mb: 3, p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Button
            variant={activeTab === 0 ? 'contained' : 'text'}
            onClick={() => onTabChange(0)}
            sx={{
              mr: 2,
              bgcolor: activeTab === 0 ? '#F36BF9' : undefined,
              color: activeTab === 0 ? '#FFFFFF' : '#2A3363',
              '&:hover': {
                bgcolor: activeTab === 0 ? '#F36BF9' : 'rgba(0,0,0,0.04)',
              },
            }}
            startIcon={<CategoryIcon />}
          >
            {t('admin.tabs.categories')}
          </Button>
          <Button
            variant={activeTab === 1 ? 'contained' : 'text'}
            onClick={() => onTabChange(1)}
            sx={{
              mr: 2,
              bgcolor: activeTab === 1 ? '#F36BF9' : undefined,
              color: activeTab === 1 ? '#FFFFFF' : '#2A3363',
              '&:hover': {
                bgcolor: activeTab === 1 ? '#F36BF9' : 'rgba(0,0,0,0.04)',
              },
            }}
            startIcon={<PlaceIcon />}
          >
            {t('admin.tabs.venues')}
          </Button>
          <Button
            variant={activeTab === 2 ? 'contained' : 'text'}
            onClick={() => onTabChange(2)}
            sx={{
              bgcolor: activeTab === 2 ? '#F36BF9' : undefined,
              color: activeTab === 2 ? '#FFFFFF' : '#2A3363',
              '&:hover': {
                bgcolor: activeTab === 2 ? '#F36BF9' : 'rgba(0,0,0,0.04)',
              },
            }}
            startIcon={<BusinessIcon />}
          >
            {t('admin.tabs.organizations')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={t('common.labels.search')}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ width: { xs: '100%', sm: 250 } }}
          />
          {showAddButton && onAddClick && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              sx={{
                bgcolor: '#F36BF9',
                '&:hover': { bgcolor: '#e055e9' },
              }}
            >
              {t('admin.tabs.add', { item: getTabLabel() })}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
