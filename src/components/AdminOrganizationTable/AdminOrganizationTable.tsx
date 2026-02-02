/**
 * AdminOrganizationTable - Refactored to use GenericDataTable
 *
 * BUSINESS LOGIC PRESERVED:
 * - Filter organizations by name/email/phone
 * - Edit/Delete/Verify actions
 * - Verification status display
 * - Contact info display
 *
 * UI CHANGES:
 * - Uses GenericDataTable for consistent table structure
 * - Centralized column definitions
 */
import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifyIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { OrganizationResponse } from '@/src/stores/types';
import { GenericDataTable, TableColumn, TableAction } from '@/src/components/common/GenericDataTable';

// ==========================================
// TYPES
// ==========================================

interface AdminOrganizationTableProps {
  organizations: OrganizationResponse[];
  isLoading: boolean;
  searchTerm: string;
  isVerifying?: boolean;
  onEditOrganization: (organization: OrganizationResponse) => void;
  onDeleteOrganization: (id: number) => void;
  onVerifyOrganization: (id: number) => void;
}

// ==========================================
// COMPONENT
// ==========================================

export const AdminOrganizationTable: React.FC<AdminOrganizationTableProps> = ({
  organizations,
  isLoading,
  searchTerm,
  isVerifying = false,
  onEditOrganization,
  onDeleteOrganization,
  onVerifyOrganization,
}) => {
  const { t } = useTranslation();

  // Column definitions
  const columns: TableColumn<OrganizationResponse>[] = [
    {
      key: 'name',
      headerKey: 'common.labels.name',
      render: (org) => (
        <Box>
          <Typography variant="body1" fontWeight="medium">
            {org.name}
          </Typography>
          {org.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {org.description.length > 60 ? `${org.description.substring(0, 60)}...` : org.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'contact',
      headerKey: 'common.labels.contact',
      render: (org) => (
        <Box>
          {org.email && (
            <Typography variant="body2" sx={{ display: 'block' }}>
              📧 {org.email}
            </Typography>
          )}
          {org.phone && (
            <Typography variant="body2" sx={{ display: 'block', mt: 0.5 }}>
              📞 {org.phone}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'verified',
      headerKey: 'common.labels.status',
      align: 'center',
      render: (org) => (
        <Chip
          label={org.verified ? t('common.status.verified') : t('common.status.unverified')}
          color={org.verified ? 'success' : 'warning'}
          size="small"
          icon={org.verified ? <VerifyIcon fontSize="small" /> : undefined}
        />
      ),
    },
  ];

  // Action definitions
  const actions: TableAction<OrganizationResponse>[] = [
    {
      type: 'custom',
      icon: <VerifyIcon />,
      tooltip: t('admin.actions.verifyOrganization'),
      onClick: (org) => onVerifyOrganization(org.id),
      disabled: isVerifying,
      color: '#4caf50',
      show: (org) => !org.verified,
    },
    {
      type: 'edit',
      icon: <EditIcon />,
      tooltip: t('common.buttons.edit'),
      onClick: onEditOrganization,
      color: '#2196f3',
    },
    {
      type: 'delete',
      icon: <DeleteIcon />,
      tooltip: t('common.buttons.delete'),
      onClick: (org) => onDeleteOrganization(org.id),
    },
  ];

  // Custom filter function for organizations
  const filterFn = (org: OrganizationResponse, term: string): boolean => {
    const lowerTerm = term.toLowerCase();
    return (
      org.name.toLowerCase().includes(lowerTerm) ||
      org.email?.toLowerCase().includes(lowerTerm) ||
      org.phone?.includes(term) ||
      false
    );
  };

  return (
    <GenericDataTable<OrganizationResponse>
      data={organizations}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchTerm={searchTerm}
      filterFn={filterFn}
      entityName="common.entities.organization"
    />
  );
};

export default AdminOrganizationTable;
