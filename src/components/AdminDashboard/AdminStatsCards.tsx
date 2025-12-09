import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Category as CategoryIcon, Place as PlaceIcon, Business as BusinessIcon } from '@mui/icons-material';

interface AdminStatsCardsProps {
  categoriesCount: number;
  venuesCount: number;
  organizationsCount?: number;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  categoriesCount,
  venuesCount,
  organizationsCount = 0
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 4,
      }}
    >
      <Box>
        <Card sx={{ bgcolor: '#2A3363', color: 'white' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CategoryIcon fontSize="large" />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {categoriesCount}
                </Typography>
                <Typography variant="body2">Total Categories</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <Box>
        <Card sx={{ bgcolor: '#F36BF9', color: 'white' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PlaceIcon fontSize="large" />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {venuesCount}
                </Typography>
                <Typography variant="body2">Total Venues</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <Box>
        <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <BusinessIcon fontSize="large" />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {organizationsCount}
                </Typography>
                <Typography variant="body2">Total Organizations</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
