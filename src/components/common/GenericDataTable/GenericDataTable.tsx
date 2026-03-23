/**
 * GenericDataTable Component
 *
 * A reusable table component that can display any entity type with configurable columns.
 * Replaces CategoryTable, VenueTable, AdminOrganizationTable with a single component.
 *
 * LOGIC PRESERVED:
 * - Filtering logic (search by configurable fields)
 * - Sorting by ID
 * - Loading state
 * - Empty state with search awareness
 * - Action buttons (edit, delete, custom)
 *
 * UI ONLY CHANGES:
 * - Consolidated JSX structure
 * - Configurable columns via props
 * - Reusable across entities
 */
'use client';

import React, { useMemo, ReactNode } from 'react';
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
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ICON_BUTTON_COLORS } from '@/src/theme/buttonStyles';

// ==========================================
// TYPES
// ==========================================

export interface TableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header label (translation key or string) */
  headerKey: string;
  /** Custom render function for cell content */
  render?: (item: T) => ReactNode;
  /** Width of the column */
  width?: string | number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether to show this column on mobile */
  hiddenOnMobile?: boolean;
}

export interface TableAction<T> {
  /** Action type for default styling */
  type: 'edit' | 'delete' | 'custom';
  /** Icon component */
  icon: ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Click handler */
  onClick: (item: T) => void;
  /** Disabled condition */
  disabled?: boolean | ((item: T) => boolean);
  /** Custom color (for custom type) */
  color?: string;
  /** Whether to show this action */
  show?: boolean | ((item: T) => boolean);
}

export interface GenericDataTableProps<T extends { id: number | string }> {
  /** Data array to display */
  data: T[];
  /** Column configuration */
  columns: TableColumn<T>[];
  /** Loading state */
  isLoading: boolean;
  /** Search term for filtering */
  searchTerm: string;
  /** Fields to search in (defaults to checking all string fields) */
  searchFields?: (keyof T)[];
  /** Custom filter function (overrides searchFields) */
  filterFn?: (item: T, searchTerm: string) => boolean;
  /** Sort function (defaults to sorting by ID) */
  sortFn?: (a: T, b: T) => number;
  /** Actions to show for each row */
  actions?: TableAction<T>[];
  /** Entity name for empty state messages */
  entityName: string;
  /** Custom empty state component */
  emptyState?: ReactNode;
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Table size */
  size?: 'small' | 'medium';
}

// ==========================================
// COMPONENT
// ==========================================

function GenericDataTable<T extends { id: number | string }>({
  data,
  columns,
  isLoading,
  searchTerm,
  searchFields,
  filterFn,
  sortFn,
  actions = [],
  entityName,
  emptyState,
  onRowClick,
  size = 'medium',
}: GenericDataTableProps<T>) {
  const { t } = useTranslation();

  // Default filter function - searches in specified fields or all string fields
  const defaultFilterFn = (item: T, term: string): boolean => {
    const lowerTerm = term.toLowerCase();
    const fieldsToSearch = searchFields || (Object.keys(item) as (keyof T)[]);

    return fieldsToSearch.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerTerm);
      }
      return false;
    });
  };

  // Default sort function - sort by ID
  const defaultSortFn = (a: T, b: T): number => {
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    const filter = filterFn || defaultFilterFn;
    const sort = sortFn || defaultSortFn;

    return data
      .filter((item) => !searchTerm || filter(item, searchTerm))
      .slice()
      .sort(sort);
  }, [data, searchTerm, filterFn, sortFn, searchFields]);

  // Resolve action visibility and disabled state
  const resolveActionProp = <P,>(
    prop: P | ((item: T) => P) | undefined,
    item: T,
    defaultValue: P
  ): P => {
    if (prop === undefined) return defaultValue;
    if (typeof prop === 'function') return (prop as (item: T) => P)(item);
    return prop;
  };

  // Get action button color
  const getActionColor = (action: TableAction<T>): string => {
    if (action.color) return action.color;
    return ICON_BUTTON_COLORS[action.type as keyof typeof ICON_BUTTON_COLORS] || ICON_BUTTON_COLORS.edit;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box>
        <TableContainer component={Paper}>
          <Table size={size}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ width: col.width }}>
                    <strong>{t(col.headerKey)}</strong>
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <strong>{t('common.labels.actions')}</strong>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>{t('common.labels.loading')}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Render empty state
  if (processedData.length === 0) {
    return (
      <Box>
        <TableContainer component={Paper}>
          <Table size={size}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ width: col.width }}>
                    <strong>{t(col.headerKey)}</strong>
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <strong>{t('common.labels.actions')}</strong>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  {emptyState || (
                    <Typography color="text.secondary" py={4}>
                      {searchTerm
                        ? t('admin.table.noItemsFound', { item: t(entityName) })
                        : t('admin.table.noItems', { item: t(entityName) })}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Render data table
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size={size}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    width: col.width,
                    display: col.hiddenOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                  }}
                  align={col.align}
                >
                  <strong>{t(col.headerKey)}</strong>
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell>
                  <strong>{t('common.labels.actions')}</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedData.map((item) => (
              <TableRow
                key={item.id}
                data-id={String(item.id)}
                hover
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={`${item.id}-${col.key}`}
                    sx={{
                      display: col.hiddenOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                    }}
                    align={col.align}
                  >
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {actions.map((action, index) => {
                        const isVisible = resolveActionProp(action.show, item, true);
                        const isDisabled = resolveActionProp(action.disabled, item, false);

                        if (!isVisible) return null;

                        const button = (
                          <IconButton
                            key={index}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            sx={{ color: getActionColor(action) }}
                            disabled={isDisabled}
                          >
                            {action.icon}
                          </IconButton>
                        );

                        if (action.tooltip) {
                          return (
                            <Tooltip key={index} title={action.tooltip}>
                              <span>{button}</span>
                            </Tooltip>
                          );
                        }

                        return button;
                      })}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default GenericDataTable;
