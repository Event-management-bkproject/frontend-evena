/**
 * VenueTable - Refactored to use GenericDataTable
 *
 * BUSINESS LOGIC PRESERVED:
 * - Filter venues by name/address/city
 * - Sort by ID
 * - Edit/Delete actions
 *
 * UI CHANGES:
 * - Uses GenericDataTable for consistent table structure
 * - Centralized column definitions
 */
'use client';

import React from 'react';
import { Typography, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericDataTable, TableColumn, TableAction } from '@/src/components/common/GenericDataTable';
import { VenueResponse } from '@/src/stores/types/event';

// ==========================================
// TYPES
// ==========================================

interface VenueTableProps {
  venues: VenueResponse[];
  isLoading: boolean;
  searchTerm: string;
  isDeletingVenue: boolean;
  onEditVenue: (venue: VenueResponse) => void;
  onDeleteVenue: (id: number) => void;
}

// ==========================================
// COMPONENT
// ==========================================

const VenueTable: React.FC<VenueTableProps> = ({
  venues,
  isLoading,
  searchTerm,
  isDeletingVenue,
  onEditVenue,
  onDeleteVenue,
}) => {
  const { t } = useTranslation();

  // Column definitions
  const columns: TableColumn<VenueResponse>[] = [
    {
      key: 'id',
      headerKey: 'common.labels.id',
      render: (venue) => venue.id,
    },
    {
      key: 'name',
      headerKey: 'common.labels.name',
      render: (venue) => (
        <Typography fontWeight="medium">{venue.name}</Typography>
      ),
    },
    {
      key: 'address',
      headerKey: 'common.labels.address',
      render: (venue) => (
        <Typography variant="body2" sx={{ maxWidth: 250 }}>
          {venue.address}
        </Typography>
      ),
    },
    {
      key: 'city',
      headerKey: 'common.labels.city',
      render: (venue) => (
        <Chip label={venue.city} variant="outlined" size="small" />
      ),
    },
    {
      key: 'capacity',
      headerKey: 'common.labels.capacity',
      render: (venue) => (
        <Chip label={venue.capacity} color="secondary" size="small" />
      ),
    },
  ];

  // Action definitions
  const actions: TableAction<VenueResponse>[] = [
    {
      type: 'edit',
      icon: <EditIcon />,
      tooltip: t('common.buttons.edit'),
      onClick: onEditVenue,
    },
    {
      type: 'delete',
      icon: <DeleteIcon />,
      tooltip: t('common.buttons.delete'),
      onClick: (venue) => onDeleteVenue(venue.id),
      disabled: isDeletingVenue,
    },
  ];

  return (
    <GenericDataTable<VenueResponse>
      data={venues}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchTerm={searchTerm}
      searchFields={['name', 'address', 'city']}
      entityName="common.entities.venue"
    />
  );
};

export default VenueTable;
