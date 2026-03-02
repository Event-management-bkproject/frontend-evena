/**
 * CategoryTable - Refactored to use GenericDataTable
 *
 * BUSINESS LOGIC PRESERVED:
 * - Filter categories by name/description
 * - Sort by ID
 * - Edit/Delete actions
 * - Icon rendering (emoji, URL, text)
 *
 * UI CHANGES:
 * - Uses GenericDataTable for consistent table structure
 * - Centralized column definitions
 */
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericDataTable, TableColumn, TableAction } from '@/src/components/common/GenericDataTable';
import { CategoryIcon, ICON_MAP } from '@/src/components/CategoryIcon/CategoryIcon';

// ==========================================
// ICON RENDERING HELPERS (PRESERVED LOGIC)
// ==========================================

const isEmoji = (text: string): boolean => {
  if (!text) return false;
  const emojiRegex = /^(\p{Emoji}|\p{Emoji_Presentation}|\p{Extended_Pictographic})+$/u;
  return emojiRegex.test(text.trim());
};

const isUrl = (text: string): boolean => {
  if (!text) return false;
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

const ICON_PREFIX = 'IconPicker/';

const renderIcon = (iconUrl?: string | null) => {
  if (!iconUrl) return null;

  // New format: "IconPicker/School" — saved by IconPicker
  const pickerName = iconUrl.startsWith(ICON_PREFIX)
    ? iconUrl.slice(ICON_PREFIX.length)
    : null;
  const resolvedName = pickerName ?? (ICON_MAP[iconUrl] ? iconUrl : null);

  if (resolvedName && ICON_MAP[resolvedName]) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(243, 107, 249, 0.08)',
          borderRadius: '8px',
        }}
      >
        <CategoryIcon iconName={resolvedName} sx={{ fontSize: 22, color: '#F36BF9' }} />
      </Box>
    );
  }

  if (isEmoji(iconUrl)) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          bgcolor: 'rgba(0, 0, 0, 0.04)',
          borderRadius: '8px',
        }}
      >
        {iconUrl}
      </Box>
    );
  } else if (isUrl(iconUrl)) {
    return (
      <img
        src={iconUrl}
        alt="Category icon"
        style={{
          width: 32,
          height: 32,
          objectFit: 'contain',
          borderRadius: '8px',
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  } else {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          bgcolor: 'rgba(0, 0, 0, 0.04)',
          borderRadius: '8px',
          fontWeight: 'bold',
        }}
      >
        {iconUrl.length > 3 ? iconUrl.substring(0, 3) : iconUrl}
      </Box>
    );
  }
};

// ==========================================
// TYPES
// ==========================================

interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string | null;
}

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  searchTerm: string;
  isDeletingCategory: boolean;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: number) => void;
}

// ==========================================
// COMPONENT
// ==========================================

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading,
  searchTerm,
  isDeletingCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { t } = useTranslation();

  // Column definitions
  const columns: TableColumn<Category>[] = [
    {
      key: 'id',
      headerKey: 'common.labels.id',
      render: (category) => category.id,
    },
    {
      key: 'iconUrl',
      headerKey: 'common.labels.icon',
      render: (category) => renderIcon(category.iconUrl),
    },
    {
      key: 'name',
      headerKey: 'common.labels.name',
      render: (category) => (
        <Typography fontWeight="medium">{category.name}</Typography>
      ),
    },
    {
      key: 'description',
      headerKey: 'common.labels.description',
      render: (category) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          {category.description || ''}
        </Typography>
      ),
    },
  ];

  // Action definitions
  const actions: TableAction<Category>[] = [
    {
      type: 'edit',
      icon: <EditIcon />,
      tooltip: t('common.buttons.edit'),
      onClick: onEditCategory,
    },
    {
      type: 'delete',
      icon: <DeleteIcon />,
      tooltip: t('common.buttons.delete'),
      onClick: (category) => onDeleteCategory(category.id),
      disabled: isDeletingCategory,
    },
  ];

  return (
    <GenericDataTable<Category>
      data={categories}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchTerm={searchTerm}
      searchFields={['name', 'description']}
      entityName="common.entities.category"
    />
  );
};

export default CategoryTable;
