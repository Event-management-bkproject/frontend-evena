// components/OrganizationGrid/OrganizationGrid.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { OrganizationResponse } from '@/src/stores/types';
import OrganizationCard from '../OrganizationCard/OrganizationCard';

interface OrganizationGridProps {
  organizations: OrganizationResponse[];
  onCardClick?: (org: OrganizationResponse) => void;
  loading?: boolean;
}

const OrganizationGrid: React.FC<OrganizationGridProps> = ({ organizations, onCardClick, loading = false }) => {
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Typography>Loading organizations...</Typography>
      </Box>
    );
  }

  if (organizations.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          No organizations found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {organizations.map((organization) => (
        <Box key={organization.id}>
          <OrganizationCard organization={organization} onClick={onCardClick} />
        </Box>
      ))}
    </Box>
  );
};

export default OrganizationGrid;
