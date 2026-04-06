'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { CameraAlt, Delete, Person, Email, Phone, Badge } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useGetMeQuery, useUploadAvatarMutation, useDeleteAvatarMutation } from '@/src/stores/services/UserApi';
import { setUser } from '@/src/stores/slices/authSlice';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { getInitials } from '@/src/utils/common.utils';
import { BRAND } from '@/src/utils/constants/constant';

export function ProfilePage() {
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Always fetch fresh data so avatarUrl is up-to-date
  const { data: meData } = useGetMeQuery();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: deleting }] = useDeleteAvatarMutation();
  const [error, setError] = useState<string | null>(null);

  // Sync fresh /auth/me data into Redux so header avatar updates too
  useEffect(() => {
    if (meData?.data && auth.user) {
      dispatch(setUser({ ...auth.user, avatarUrl: meData.data.avatarUrl ?? null }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData?.data?.avatarUrl]);

  const user = meData?.data ?? auth.user;
  if (!user) return null;

  const avatarUrl = user.avatarUrl ?? null;
  const initials = getInitials(user.name);
  const isBusy = uploading || deleting;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadAvatar(formData).unwrap();
      // invalidatesTags: ['User'] triggers useGetMeQuery refetch automatically
      // useEffect above syncs the new avatarUrl into Redux for the header
    } catch {
      setError('Failed to upload avatar. Please try again.');
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteAvatar().unwrap();
    } catch {
      setError('Failed to delete avatar. Please try again.');
    }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      ADMIN:     { label: 'Admin',     color: '#fff',     bg: '#36437C' },
      ORGANIZER: { label: 'Organizer', color: '#fff',     bg: BRAND.primary },
      USER:      { label: 'User',      color: '#36437C',  bg: '#EEF0FA' },
    };
    const cfg = map[role] ?? { label: role, color: '#36437C', bg: '#EEF0FA' };
    return (
      <Chip
        key={role}
        label={cfg.label}
        size="small"
        sx={{ color: cfg.color, bgcolor: cfg.bg, fontWeight: 600, fontSize: '0.7rem' }}
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', py: 4 }}>
      {/* Avatar card */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Avatar with overlay */}
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Avatar
            src={avatarUrl ?? undefined}
            sx={{
              width: 100,
              height: 100,
              bgcolor: BRAND.darkSecondary,
              fontSize: '2rem',
              border: `3px solid ${avatarUrl ? BRAND.primary : BRAND.primaryLight}`,
            }}
          >
            {!avatarUrl && initials}
          </Avatar>

          {/* Upload overlay button */}
          <Tooltip title="Change photo">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: BRAND.primary,
                color: '#fff',
                width: 30,
                height: 30,
                '&:hover': { bgcolor: BRAND.primaryHover },
                '&:disabled': { bgcolor: '#ccc' },
              }}
            >
              {uploading ? <CircularProgress size={14} color="inherit" /> : <CameraAlt sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} color={BRAND.dark}>
            {user.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 0.5, flexWrap: 'wrap' }}>
            {user.roles.map(roleBadge)}
          </Box>
        </Box>

        {/* Delete avatar button — only show when avatar exists */}
        {avatarUrl && (
          <Button
            variant="outlined"
            size="small"
            startIcon={deleting ? <CircularProgress size={14} /> : <Delete />}
            onClick={handleDelete}
            disabled={isBusy}
            sx={{
              borderColor: '#FF5B5E',
              color: '#FF5B5E',
              '&:hover': { borderColor: '#cc4b4e', bgcolor: '#fff0f0' },
              fontSize: '0.75rem',
            }}
          >
            Remove photo
          </Button>
        )}

        {error && (
          <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Info card */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: 3,
          mt: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color={BRAND.dark} sx={{ mb: 2 }}>
          Account Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <InfoRow icon={<Person />} label="Name" value={user.name} />
          <InfoRow icon={<Email />} label="Email" value={user.email} />
          {user.phone && <InfoRow icon={<Phone />} label="Phone" value={user.phone} />}
          <InfoRow
            icon={<Badge />}
            label="Status"
            value={
              <Chip
                label={user.status}
                size="small"
                sx={{
                  bgcolor: user.status === 'ACTIVE' ? '#E8F5E9' : '#FFEBEE',
                  color: user.status === 'ACTIVE' ? '#2E7D32' : '#C62828',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: BRAND.darkSecondary, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
          {label}
        </Typography>
        {typeof value === 'string' ? (
          <Typography variant="body2" fontWeight={500} noWrap>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}

export default ProfilePage;
