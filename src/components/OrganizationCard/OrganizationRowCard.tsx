'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip, Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { People, Verified, Event, Group } from '@mui/icons-material';
import { OrganizationResponse } from '@/src/stores/types';

interface OrganizationRowCardProps {
  organization: OrganizationResponse;
  onEdit: (organization: OrganizationResponse) => void;
  onDelete: (organization: OrganizationResponse) => void;
  onManageMembers: (organization: OrganizationResponse) => void;
  onClick?: (organization: OrganizationResponse) => void;
}

export function OrganizationRowCard({ organization, onEdit, onDelete, onManageMembers, onClick }: OrganizationRowCardProps) {
  return (
    <Card
      onClick={() => onClick?.(organization)}
      sx={{
        mb: 2,
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Logo/Avatar */}
          <Avatar
            src={organization.logoUrl}
            alt={organization.name}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '12px',
              bgcolor: '#f36bf9',
              fontSize: '32px',
              fontWeight: 700,
            }}
          >
            {organization.name.charAt(0).toUpperCase()}
          </Avatar>

          {/* Organization Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {organization.name}
              </Typography>
              {organization.verified && (
                <Chip
                  icon={<Verified sx={{ fontSize: 16 }} />}
                  label="Verified"
                  size="small"
                  sx={{
                    backgroundColor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: '#2E7D32',
                    },
                  }}
                />
              )}
            </Box>

            {organization.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {organization.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {organization.email && (
                <Typography variant="body2" color="text.secondary">
                  📧 {organization.email}
                </Typography>
              )}
              {organization.phone && (
                <Typography variant="body2" color="text.secondary">
                  📞 {organization.phone}
                </Typography>
              )}
              {organization.website && (
                <Typography
                  variant="body2"
                  color="primary"
                  component="a"
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  🌐 {organization.website}
                </Typography>
              )}
            </Box>

            {/* Members Avatars */}
            {organization.members && organization.members.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Members ({organization.members.filter(m => m.invitationAccepted).length})
                </Typography>
                <AvatarGroup
                  max={7}
                  sx={{
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      border: '2px solid white',
                    },
                  }}
                >
                  {organization.members
                    .filter(member => member.invitationAccepted)
                    .map((member) => (
                      <Tooltip key={member.id} title={`${member.userName} (${member.role})`} arrow>
                        <Avatar sx={{ bgcolor: '#f36bf9' }}>
                          {member.userName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                </AvatarGroup>
              </Box>
            )}
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#F3F4F6',
                borderRadius: '12px',
                minWidth: 80,
              }}
            >
              <Event sx={{ color: '#f36bf9', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={600}>
                {organization.totalEvents || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Events
              </Typography>
            </Box>

            {organization.totalMembers !== undefined && (
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  backgroundColor: '#F3F4F6',
                  borderRadius: '12px',
                  minWidth: 80,
                }}
              >
                <Group sx={{ color: '#f36bf9', mb: 0.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  {organization.totalMembers || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Members
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onManageMembers(organization);
              }}
              sx={{
                color: '#f36bf9',
                backgroundColor: '#FFF4FF',
                '&:hover': {
                  backgroundColor: '#FFE4FF',
                },
              }}
              title="Manage Members"
            >
              <People />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEdit(organization);
              }}
              sx={{
                color: '#F36BF9',
                padding: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(243, 107, 249, 0.1)',
                },
              }}
              title="Edit"
            >
              <Box component="i" className="fa-regular fa-pen-to-square" sx={{ fontSize: '20px' }} />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete(organization);
              }}
              sx={{
                color: '#36437C',
                padding: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(54, 67, 124, 0.1)',
                },
              }}
              title="Delete"
            >
              <Box component="i" className="fa-solid fa-trash" sx={{ fontSize: '20px' }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
