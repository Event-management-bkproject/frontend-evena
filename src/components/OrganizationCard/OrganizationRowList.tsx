'use client';

import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { OrganizationRowCard } from './OrganizationRowCard';
import { OrganizationResponse } from '@/src/stores/types';

interface OrganizationRowListProps {
  organizations: OrganizationResponse[];
  onEdit: (organization: OrganizationResponse) => void;
  onDelete: (organization: OrganizationResponse) => void;
  onManageMembers: (organization: OrganizationResponse) => void;
  onClick?: (organization: OrganizationResponse) => void;
  loading?: boolean;
}

export function OrganizationRowList({
  organizations,
  onEdit,
  onDelete,
  onManageMembers,
  onClick,
  loading = false,
}: OrganizationRowListProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#f36bf9' }} />
      </Box>
    );
  }

  if (organizations.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px dashed #E0E0E0',
        }}
      >
        <Typography variant="h5" gutterBottom color="text.secondary" fontWeight={600}>
          No Organizations Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get started by creating your first organization
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
      </Typography>
      {organizations.map((organization) => (
        <OrganizationRowCard
          key={organization.id}
          organization={organization}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageMembers={onManageMembers}
          onClick={onClick}
        />
      ))}
    </Box>
  );
}
