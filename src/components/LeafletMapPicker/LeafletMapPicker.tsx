'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';
import SnackbarNotification from '../SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';

// Import MapContainer wrapper để tránh SSR issues
const MapContainerWrapper = dynamic(() => import('@/src/components/LeafletMapPicker/MapContainerWrapper'), {
  ssr: false,
  loading: () => <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</Box>
});

interface LeafletMapPickerProps {
  lat?: number;
  lng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: number | string;
}

export default function LeafletMapPicker({ lat, lng, onLocationSelect, height = 400 }: LeafletMapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : [10.762622, 106.660172] // Default: Ho Chi Minh City
  );
  const mapRef = useRef<LeafletMap | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng, address);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          onLocationSelect(latitude, longitude);

          // Pan map to current location
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          showSnackbar('Could not get your location. Please allow location access.', 'error');
        }
      );
    } else {
      showSnackbar('Geolocation is not supported by your browser.', 'error');
    }
  };

  if (!mounted) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <Typography>Loading map...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Click on the map to select venue location
        </Typography>
        <Tooltip title="Use my current location">
          <IconButton onClick={handleGetCurrentLocation} size="small" color="primary">
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          height,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid #e0e0e0',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
          },
        }}
      >
        <MapContainerWrapper
          center={position || [10.762622, 106.660172]}
          zoom={13}
          position={position}
          onLocationSelect={handleLocationSelect}
          mapRef={mapRef}
        />
      </Box>

      {position && (
        <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            <strong>Selected:</strong> Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </Typography>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
