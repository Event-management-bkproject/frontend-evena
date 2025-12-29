'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, InputAdornment, Typography, IconButton, Badge } from '@mui/material';
import { Search, Add, Notifications } from '@mui/icons-material';
import { OrganizationResponse } from '@/src/stores/types';
import { useGetPendingInvitationsQuery } from '@/src/stores/services/OrganizationMemberApi';
import InvitationNotificationModal from '../InvitationNotificationModal';

interface OrganizationFiltersProps {
  onSearch: (keyword: string) => void;
  onCreateClick: () => void;
  organizations: OrganizationResponse[];
  loading?: boolean;
}

export default function OrganizationFilters({
  onSearch,
  onCreateClick,
  organizations,
  loading = false,
}: OrganizationFiltersProps) {
  const [searchValue, setSearchValue] = useState('');
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);

  // Fetch pending invitations count
  const { data: invitationsData } = useGetPendingInvitationsQuery();
  const pendingCount = invitationsData?.data?.length || 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const totalOrganizations = organizations.length;
  const verifiedOrganizations = organizations.filter((org) => org.verified).length;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Row: Search and Create Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        {/* Search */}
        <TextField
          placeholder="Search organizations..."
          value={searchValue}
          onChange={handleSearchChange}
          disabled={loading}
          sx={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '& fieldset': {
                borderColor: '#E0E0E0',
              },
              '&:hover fieldset': {
                borderColor: '#B0B0B0',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#f36bf9',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#888' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Invitation Notification Button */}
        <IconButton
          onClick={() => setInvitationModalOpen(true)}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '12px',
            padding: '12px',
            '&:hover': {
              backgroundColor: '#F5F5F5',
            },
          }}
        >
          <Badge badgeContent={pendingCount} color="error">
            <Notifications sx={{ color: '#888' }} />
          </Badge>
        </IconButton>

        {/* Create Organization Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateClick}
          disabled={loading}
          sx={{
            backgroundColor: '#f36bf9',
            borderRadius: '12px',
            padding: '12px 24px',
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#e55ae0',
            },
            '&:disabled': {
              backgroundColor: '#cccccc',
            },
          }}
        >
          Create Organization
        </Button>
      </Box>

      {/* Invitation Modal */}
      <InvitationNotificationModal open={invitationModalOpen} onClose={() => setInvitationModalOpen(false)} />

      {/* Stats Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Total Organizations
          </Typography>
          <Typography variant="h5" fontWeight={600} color="primary">
            {totalOrganizations}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, borderLeft: '1px solid #E0E0E0', pl: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Verified
          </Typography>
          <Typography variant="h5" fontWeight={600} color="success.main">
            {verifiedOrganizations}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, borderLeft: '1px solid #E0E0E0', pl: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Pending Verification
          </Typography>
          <Typography variant="h5" fontWeight={600} color="warning.main">
            {totalOrganizations - verifiedOrganizations}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
