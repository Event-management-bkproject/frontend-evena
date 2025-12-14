'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarkerProps {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

function LocationMarker({ position, onLocationSelect }: LocationMarkerProps) {
  const [markerPosition, setMarkerPosition] = useState(position);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onLocationSelect(lat, lng);

      // Reverse geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.display_name) {
            onLocationSelect(lat, lng, data.display_name);
          }
        })
        .catch((err) => console.error('Reverse geocoding error:', err));
    },
  });

  useEffect(() => {
    if (position) {
      setMarkerPosition(position);
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>
        Selected Location
        <br />
        Lat: {markerPosition[0].toFixed(6)}
        <br />
        Lng: {markerPosition[1].toFixed(6)}
      </Popup>
    </Marker>
  ) : null;
}

interface MapContainerWrapperProps {
  center: [number, number];
  zoom: number;
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  mapRef: React.MutableRefObject<LeafletMap | null>;
}

export default function MapContainerWrapper({
  center,
  zoom,
  position,
  onLocationSelect,
  mapRef,
}: MapContainerWrapperProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}
