import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as VerifyIcon } from '@mui/icons-material';
import { OrganizationResponse } from '@/src/stores/types';
import { useTranslation } from 'react-i18next';

interface AdminOrganizationTableProps {
  organizations: OrganizationResponse[];
  isLoading: boolean;
  searchTerm: string;
  isVerifying?: boolean;
  onEditOrganization: (organization: OrganizationResponse) => void;
  onDeleteOrganization: (id: number) => void;
  onVerifyOrganization: (id: number) => void;
}

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

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.phone?.includes(searchTerm),
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (filteredOrganizations.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {searchTerm ? t('admin.table.noItemsFound', { item: t('common.entities.organization') }) : t('admin.table.noItems', { item: t('common.entities.organization') })}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('common.labels.name')}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('common.labels.contact')}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              {t('common.labels.status')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              {t('common.labels.actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrganizations.map((org) => (
            <TableRow key={org.id} hover>
              <TableCell>
                <Typography variant="body1" fontWeight="medium">
                  {org.name}
                </Typography>
                {org.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {org.description.length > 60 ? `${org.description.substring(0, 60)}...` : org.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={org.verified ? t('common.status.verified') : t('common.status.unverified')}
                  color={org.verified ? 'success' : 'warning'}
                  size="small"
                  icon={org.verified ? <CheckCircle /> : undefined}
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {!org.verified && (
                    <Tooltip title={t('admin.actions.verifyOrganization')}>
                      <IconButton
                        onClick={() => onVerifyOrganization(org.id)}
                        disabled={isVerifying}
                        sx={{
                          color: '#4caf50',
                          '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' },
                        }}
                      >
                        <VerifyIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t('common.buttons.edit')}>
                    <IconButton
                      onClick={() => onEditOrganization(org)}
                      sx={{
                        color: '#2196f3',
                        '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.buttons.delete')}>
                    <IconButton
                      onClick={() => onDeleteOrganization(org.id)}
                      sx={{
                        color: '#f44336',
                        '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminOrganizationTable;

// CheckCircle icon component (if not imported from MUI)
const CheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
