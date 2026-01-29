// app/dashboard/admin/components/VenueTable.tsx
'use client';

import React from 'react';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface VenueTableProps {
  venues: any[];
  isLoading: boolean;
  searchTerm: string;
  isDeletingVenue: boolean;
  onEditVenue: (venue: any) => void;
  onDeleteVenue: (id: number) => void;
}

const VenueTable: React.FC<VenueTableProps> = ({
  venues,
  isLoading,
  searchTerm,
  isDeletingVenue,
  onEditVenue,
  onDeleteVenue,
}) => {
  const { t } = useTranslation();

  // Filter venues
  const filteredVenues = venues
    .filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.city.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice()
    .sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell>
                <strong>{t('common.labels.id')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.name')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.address')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.city')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.capacity')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('common.labels.actions')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('common.labels.loading')}
                </TableCell>
              </TableRow>
            ) : filteredVenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm ? t('admin.table.noItemsFound', { item: t('common.entities.venue') }) : t('admin.table.noItems', { item: t('common.entities.venue') })}
                </TableCell>
              </TableRow>
            ) : (
              filteredVenues.map((venue: any) => (
                <TableRow key={venue.id} hover>
                  <TableCell>{venue.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{venue.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }}>
                      {venue.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={venue.city} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={venue.capacity} color="secondary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => onEditVenue(venue)} sx={{ color: '#36437C' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteVenue(venue.id)}
                        sx={{ color: '#f44336' }}
                        disabled={isDeletingVenue}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VenueTable;
