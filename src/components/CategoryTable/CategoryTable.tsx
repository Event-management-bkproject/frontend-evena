// app/dashboard/admin/components/CategoryTable.tsx
'use client';

import React from 'react';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Helper function to check if iconUrl is an emoji or a URL
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

const renderIcon = (iconUrl?: string | null) => {
  if (!iconUrl) return null;

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

interface CategoryTableProps {
  categories: any[];
  isLoading: boolean;
  searchTerm: string;
  isDeletingCategory: boolean;
  onEditCategory: (category: any) => void;
  onDeleteCategory: (id: number) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading,
  searchTerm,
  isDeletingCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { t } = useTranslation();

  // Filter categories
  const filteredCategories = categories
    .filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice()
    .sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell>
                <strong>{t('common.labels.id')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.icon')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.name')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.description')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.actions')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.labels.loading')}
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {searchTerm ? t('admin.table.noItemsFound', { item: t('common.entities.category') }) : t('admin.table.noItems', { item: t('common.entities.category') })}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category: any) => (
                <TableRow key={category.id} hover>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{renderIcon(category.iconUrl)}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{category.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                      {category.description || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => onEditCategory(category)} sx={{ color: '#36437C' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteCategory(category.id)}
                        sx={{ color: '#f44336' }}
                        disabled={isDeletingCategory}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CategoryTable;
