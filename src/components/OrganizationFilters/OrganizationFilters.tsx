'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, InputAdornment, Typography, IconButton, Badge } from '@mui/material';
import { Search, Add, Notifications, Business, CheckCircle, HourglassEmpty } from '@mui/icons-material';

import { OrganizationResponse } from '@/src/stores/types';
import { useGetPendingInvitationsQuery } from '@/src/stores/services/OrganizationMemberApi';
import InvitationNotificationModal from '../InvitationNotificationModal';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);

  // Fetch pending invitations count (auto-refreshed by SSEProvider invalidating 'Invitation' tag)
  const { data: invitationsData } = useGetPendingInvitationsQuery();
  const pendingCount = invitationsData?.data?.length ?? 0;

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
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 3, alignItems: 'center' }}>
        {/* Search */}
        <TextField
          placeholder={t('searchBar.searchOrganizations')}
          value={searchValue}
          onChange={handleSearchChange}
          disabled={loading}
          sx={{
            flex: 1,
            minWidth: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '& fieldset': { borderColor: '#E0E0E0' },
              '&:hover fieldset': { borderColor: '#B0B0B0' },
              '&.Mui-focused fieldset': { borderColor: '#f36bf9' },
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
            padding: { xs: '8px', sm: '12px' },
            flexShrink: 0,
            '&:hover': { backgroundColor: '#F5F5F5' },
          }}
        >
          <Badge badgeContent={pendingCount} color="error">
            <Notifications sx={{ color: '#888' }} />
          </Badge>
        </IconButton>

        {/* Create Organization Button — icon-only on xs, full label on sm+ */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateClick}
          disabled={loading}
          sx={{
            backgroundColor: '#f36bf9',
            borderRadius: '12px',
            padding: { xs: '10px', sm: '12px 24px' },
            minWidth: 0,
            flexShrink: 0,
            textTransform: 'none',
            fontSize: { xs: '13px', sm: '16px' },
            fontWeight: 600,
            whiteSpace: 'nowrap',
            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: '-4px' } },
            '&:hover': { backgroundColor: '#e55ae0' },
            '&:disabled': { backgroundColor: '#cccccc' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {t('organizationFilter.createOrganization')}
          </Box>
        </Button>
      </Box>

      {/* Invitation Modal */}
      <InvitationNotificationModal open={invitationModalOpen} onClose={() => setInvitationModalOpen(false)} />

      {/* Stats Row */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          overflow: 'hidden',
        }}
      >
        {[
          { icon: <Business sx={{ fontSize: 18, color: '#5C6BC0' }} />, label: t('organizationFilter.totalOrganizations'), value: totalOrganizations, color: '#5C6BC0', bg: '#EEF0FA' },
          { icon: <CheckCircle sx={{ fontSize: 18, color: '#2E7D32' }} />, label: t('organizationFilter.verified'), value: verifiedOrganizations, color: '#2E7D32', bg: '#E8F5E9' },
          { icon: <HourglassEmpty sx={{ fontSize: 18, color: '#E65100' }} />, label: t('organizationFilter.pendingVerification'), value: totalOrganizations - verifiedOrganizations, color: '#E65100', bg: '#FFF3E0' },
        ].map((stat, idx) => (
          <Box
            key={idx}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              px: { xs: 1.5, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              borderLeft: idx > 0 ? '1px solid #E0E0E0' : 'none',
              minWidth: 0,
            }}
          >
            <Box sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, borderRadius: '10px', bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {stat.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} sx={{ color: stat.color, lineHeight: 1, mb: 0.25, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', fontSize: { xs: '10px', sm: '11px' }, lineHeight: 1.2, display: 'block' }}>
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
