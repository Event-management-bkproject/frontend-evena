// components/OrganizationCard/OrganizationCard.tsx
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CardActionArea,
  Avatar,
} from '@mui/material';
import { MoreVert, Email, Phone, Language, Edit, Delete, Event, Verified, Pending } from '@mui/icons-material';
import { OrganizationResponse } from '@/src/stores/types';

interface OrganizationCardProps {
  organization: OrganizationResponse;
  onEdit?: (org: OrganizationResponse) => void;
  onDelete?: (org: OrganizationResponse) => void;
  onClick?: (org: OrganizationResponse) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  variant = 'default',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault(); // Ngăn chặn event bubble lên CardActionArea
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(organization);
    setAnchorEl(null);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.(organization);
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    onClick?.(organization);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cardContent = (
    <CardContent sx={{ p: variant === 'compact' ? 2 : 3, flex: 1 }}>
      {/* Header with avatar, name and actions */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: variant === 'compact' ? 40 : 48,
              height: variant === 'compact' ? 40 : 48,
              fontSize: variant === 'compact' ? '0.875rem' : '1rem',
            }}
          >
            {getInitials(organization.name)}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              variant={variant === 'compact' ? 'subtitle1' : 'h6'}
              component="h3"
              fontWeight="bold"
              sx={{
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {organization.name}
            </Typography>
            {variant === 'compact' && organization.email && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {organization.email}
              </Typography>
            )}
          </Box>
        </Box>

        {showActions && (
          <Box
            onClick={(e) => e.stopPropagation()} // Ngăn chặn click event lan ra ngoài
            onMouseDown={(e) => e.stopPropagation()} // Ngăn chặn mouse down event
          >
            <IconButton size="small" onClick={handleMenuClick} sx={{ mt: -0.5 }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Status Chip */}
      <Box mb={variant === 'compact' ? 1 : 2}>
        <Chip
          icon={organization.verified ? <Verified fontSize="small" /> : <Pending fontSize="small" />}
          label={organization.verified ? 'Verified' : 'Pending'}
          size="small"
          color={organization.verified ? 'success' : 'warning'}
          variant={organization.verified ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Description - only show in default variant */}
      {variant === 'default' && organization.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {organization.description}
        </Typography>
      )}

      {/* Contact Info */}
      <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
        {variant === 'default' && organization.email && (
          <Box display="flex" alignItems="center" gap={1}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {organization.email}
            </Typography>
          </Box>
        )}

        {organization.phone && (
          <Box display="flex" alignItems="center" gap={1}>
            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {organization.phone}
            </Typography>
          </Box>
        )}

        {organization.website && (
          <Box display="flex" alignItems="center" gap={1}>
            <Language sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              component="a"
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              Website
            </Typography>
          </Box>
        )}

        {/* Events Count */}
        <Box display="flex" alignItems="center" gap={1}>
          <Event sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {organization.totalEvents || 0} events
          </Typography>
        </Box>
      </Box>
    </CardContent>
  );

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
            borderColor: 'primary.light',
          },
        }}
      >
        {onClick ? (
          <CardActionArea onClick={handleCardClick} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {cardContent}
          </CardActionArea>
        ) : (
          cardContent
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default OrganizationCard;
