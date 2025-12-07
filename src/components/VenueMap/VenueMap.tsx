'use client';

import { Box } from '@mui/material';

interface VenueMapProps {
  lat: number;
  lng: number;
  venueName: string;
  height?: number;
}

const VenueMap = ({ lat, lng, venueName, height = 400 }: VenueMapProps) => {
  // Google Maps Embed URL
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;

  return (
    <Box
      sx={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <iframe
        title={`Map for ${venueName}`}
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Box>
  );
};

export default VenueMap;
