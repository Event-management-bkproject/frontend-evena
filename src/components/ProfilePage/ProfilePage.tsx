'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  CameraAlt,
  Delete,
  Person,
  Email,
  Phone,
  Badge,
  VerifiedUser,
} from '@mui/icons-material';
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

  const { data: meData } = useGetMeQuery();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: deleting }] = useDeleteAvatarMutation();
  const [error, setError] = useState<string | null>(null);

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
    if (file.size > 5 * 1024 * 1024) { setError('File size must be under 5 MB'); return; }
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); return; }
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAvatar(formData).unwrap();
    } catch {
      setError('Failed to upload avatar. Please try again.');
    }
  };

  const handleDelete = async () => {
    setError(null);
    try { await deleteAvatar().unwrap(); }
    catch { setError('Failed to delete avatar. Please try again.'); }
  };

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    ADMIN:     { label: 'Admin',     color: '#fff', bg: '#36437C' },
    ORGANIZER: { label: 'Organizer', color: '#fff', bg: BRAND.primary },
    USER:      { label: 'Member',    color: '#36437C', bg: '#EEF0FA' },
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 3, px: 1 }}>

      {/* ── Hero card ── */}
      <Box
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          mb: 2.5,
        }}
      >
        {/* Gradient banner */}
        <Box
          sx={{
            height: 110,
            background: 'linear-gradient(135deg, #2A3363 0%, #6B3FA0 60%, #F36BF9 100%)',
          }}
        />

        {/* Avatar + actions row */}
        <Box
          sx={{
            bgcolor: '#fff',
            px: 3,
            pb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            gap: 2,
          }}
        >
          {/* Avatar overlapping banner */}
          <Box sx={{ position: 'relative', mt: '-52px', flexShrink: 0 }}>
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                width: 104,
                height: 104,
                bgcolor: BRAND.darkSecondary,
                fontSize: '2rem',
                border: '4px solid #fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
            >
              {!avatarUrl && initials}
            </Avatar>
            <Tooltip title="Change photo">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  bgcolor: BRAND.primary,
                  color: '#fff',
                  width: 28,
                  height: 28,
                  '&:hover': { bgcolor: BRAND.primaryHover },
                  '&:disabled': { bgcolor: '#ccc' },
                }}
              >
                {uploading
                  ? <CircularProgress size={13} color="inherit" />
                  : <CameraAlt sx={{ fontSize: 14 }} />}
              </IconButton>
            </Tooltip>
          </Box>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

          {/* Name + roles */}
          <Box sx={{ flex: 1, minWidth: 0, pt: { xs: 0, sm: 1 } }}>
            <Typography
              variant="h6"
              fontWeight={700}
              color={BRAND.dark}
              noWrap
              sx={{ fontSize: { xs: '1rem', sm: '1.15rem' } }}
            >
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
              {user.roles.map((role) => {
                const cfg = roleConfig[role] ?? { label: role, color: '#36437C', bg: '#EEF0FA' };
                return (
                  <Chip
                    key={role}
                    label={cfg.label}
                    size="small"
                    sx={{ color: cfg.color, bgcolor: cfg.bg, fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Remove photo button */}
          {avatarUrl && (
            <Button
              variant="outlined"
              size="small"
              startIcon={deleting ? <CircularProgress size={13} /> : <Delete sx={{ fontSize: 15 }} />}
              onClick={handleDelete}
              disabled={isBusy}
              sx={{
                borderColor: BRAND.error,
                color: BRAND.error,
                fontSize: '0.75rem',
                height: 32,
                flexShrink: 0,
                '&:hover': { borderColor: BRAND.errorText, bgcolor: BRAND.errorBg },
              }}
            >
              Remove photo
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1.5, px: 0.5 }}>
          {error}
        </Typography>
      )}

      {/* ── Account info grid ── */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '20px',
          p: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Section header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <VerifiedUser sx={{ color: BRAND.primary, fontSize: 18 }} />
          <Typography variant="subtitle1" fontWeight={700} color={BRAND.dark}>
            Account Information
          </Typography>
        </Box>

        {/* 2-column grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <InfoCard icon={<Person sx={{ fontSize: 18 }} />} label="Full Name"    value={user.name} />
          <InfoCard icon={<Email   sx={{ fontSize: 18 }} />} label="Email"        value={user.email} />
          {user.phone && (
            <InfoCard icon={<Phone sx={{ fontSize: 18 }} />} label="Phone"       value={user.phone} />
          )}
          <InfoCard
            icon={<Badge sx={{ fontSize: 18 }} />}
            label="Status"
            value={
              <Chip
                label={user.status}
                size="small"
                sx={{
                  bgcolor: user.status === 'ACTIVE' ? BRAND.successBg  : BRAND.errorBg,
                  color:   user.status === 'ACTIVE' ? BRAND.successText : BRAND.errorText,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

// ─── InfoCard ─────────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 2,
        borderRadius: '12px',
        border: '1px solid #EEF0FA',
        backgroundColor: '#FAFBFF',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: '10px',
          bgcolor: '#EEF0FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: BRAND.darkSecondary,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </Typography>
        {typeof value === 'string' ? (
          <Typography variant="body2" fontWeight={600} color={BRAND.dark} noWrap>
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
