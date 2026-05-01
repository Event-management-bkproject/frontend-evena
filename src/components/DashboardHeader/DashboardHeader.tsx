'use client';

import { useState } from 'react';
import { Box, Breadcrumbs, Typography, IconButton, Avatar, Badge } from '@mui/material';
import { Notifications, Settings, NavigateNext } from '@mui/icons-material';
import Link from 'next/link';
import { DashboardHeaderProps } from './types';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { getInitials } from '@/src/utils/common.utils';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetMeQuery } from '@/src/stores/services/UserApi';

export function DashboardHeader({
  title,
  breadcrumbs = [],
  userName,
  userAvatar,
  onNotificationClick,
  onSettingsClick,
  onProfileClick,
}: DashboardHeaderProps) {
  const { auth } = useAuth();
  const { data: meData } = useGetMeQuery();

  const resolvedName = userName || meData?.data?.name || auth.user?.name || 'User';
  const resolvedAvatar = userAvatar || meData?.data?.avatarUrl || auth.user?.avatarUrl || undefined;
  const [languageSwitcherOpen, setLanguageSwitcherOpen] = useState(false);

  const handleSettingsClick = () => {
    setLanguageSwitcherOpen(true);
    onSettingsClick?.();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 3,
        backgroundColor: '#F7F7F7',
        borderRadius: '20px',
      }}
    >
      {/* Left: Breadcrumbs */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast || !crumb.href ? (
              <Typography
                key={index}
                color="text.primary"
                fontWeight={isLast ? 400 : 400}
                sx={{ color: isLast ? '#F36BF9' : '#ADACAE' }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link key={index} href={crumb.href} style={{ textDecoration: 'none' }}>
                <Typography
                  color="text.secondary"
                  sx={{
                    color: '#ADACAE',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {crumb.label}
                </Typography>
              </Link>
            );
          })}
        </Breadcrumbs>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            mt: 0.5,
            color: '#36437C',
            fontSize: '1.75rem',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right: Actions and User Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {/* Notifications */}
        <IconButton
          onClick={onNotificationClick}
          size="medium"
          sx={{
            borderRadius: '50%',
            backgroundColor: '#36437C',
            color: 'white',
            '&:hover': {
              backgroundColor: '#2a3456',
            },
          }}
        >
          <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#F06CF6' } }}>
            <Notifications />
          </Badge>
        </IconButton>

        {/* Settings */}
        <IconButton
          onClick={handleSettingsClick}
          size="medium"
          sx={{
            borderRadius: '50%',
            backgroundColor: '#36437C',
            color: 'white',
            '&:hover': {
              backgroundColor: '#2a3456',
            },
          }}
        >
          <Settings />
        </IconButton>

        {/* User Profile */}
        <Box
          onClick={onProfileClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <Avatar
            src={resolvedAvatar}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {!resolvedAvatar && getInitials(resolvedName)}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {resolvedName}
          </Typography>
        </Box>
      </Box>

      {/* Language Switcher Modal */}
      <LanguageSwitcher open={languageSwitcherOpen} onClose={() => setLanguageSwitcherOpen(false)} />
    </Box>
  );
}

export default DashboardHeader;
