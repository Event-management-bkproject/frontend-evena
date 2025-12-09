'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  label?: string;
  helperText?: string;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  lat,
  lng,
  onLocationChange,
  label = 'Location',
  helperText = 'Click on the map to select a location',
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Default to Ho Chi Minh City center
  const defaultCenter: [number, number] = [10.762622, 106.660172];

  useEffect(() => {
    if (lat && lng) {
      setPosition(L.latLng(lat, lng));
    }
  }, [lat, lng]);

  useEffect(() => {
    if (position) {
      onLocationChange(position.lat, position.lng);
    }
  }, [position, onLocationChange]);

  // Force map to re-render when dialog opens
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, []);

  const center: [number, number] = position ? [position.lat, position.lng] : defaultCenter;

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <Paper elevation={0} sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
          <MapContainer
            key={mapKey}
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </Box>
      </Paper>
      {helperText && (
        <Typography variant="caption" sx={{ mt: 0.5, color: '#666', display: 'block' }}>
          {helperText}
        </Typography>
      )}
      {position && (
        <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Selected: Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapPicker;
