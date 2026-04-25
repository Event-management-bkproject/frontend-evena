import React from 'react';
import { Box, Button, TextField, Paper } from '@mui/material';
import { Add as AddIcon, Category as CategoryIcon, Place as PlaceIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ADMIN } from '@/src/utils/constants/adminBrand';

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

  const getTabLabel = () =>
    activeTab === 0 ? t('common.entities.category') : t('common.entities.venue');

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${ADMIN.border}`,
        backgroundColor: ADMIN.cardBg,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Tab buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={activeTab === 0 ? 'contained' : 'text'}
            onClick={() => onTabChange(0)}
            startIcon={<CategoryIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: activeTab === 0 ? 600 : 400,
              fontSize: 13,
              borderRadius: '8px',
              bgcolor: activeTab === 0 ? ADMIN.primary : 'transparent',
              color: activeTab === 0 ? '#fff' : ADMIN.textSecondary,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: activeTab === 0 ? ADMIN.primaryHover : ADMIN.pageBg,
                boxShadow: 'none',
              },
            }}
          >
            {t('admin.tabs.categories')}
          </Button>
          <Button
            variant={activeTab === 1 ? 'contained' : 'text'}
            onClick={() => onTabChange(1)}
            startIcon={<PlaceIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: activeTab === 1 ? 600 : 400,
              fontSize: 13,
              borderRadius: '8px',
              bgcolor: activeTab === 1 ? ADMIN.primary : 'transparent',
              color: activeTab === 1 ? '#fff' : ADMIN.textSecondary,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: activeTab === 1 ? ADMIN.primaryHover : ADMIN.pageBg,
                boxShadow: 'none',
              },
            }}
          >
            {t('admin.tabs.venues')}
          </Button>
        </Box>

        {/* Search + Add */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={t('common.labels.search')}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: ADMIN.textMuted, fontSize: 18 }} /> }}
            sx={{
              width: { xs: '100%', sm: 220 },
              '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 },
            }}
          />
          {showAddButton && onAddClick && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: '8px',
                bgcolor: ADMIN.primary,
                boxShadow: 'none',
                '&:hover': { bgcolor: ADMIN.primaryHover, boxShadow: 'none' },
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
