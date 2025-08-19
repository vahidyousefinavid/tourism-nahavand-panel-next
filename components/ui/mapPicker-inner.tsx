'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

interface MapPickerProps {
  value?: string;
  onChange: (coords: string) => void;
}

function LocationMarker({ value, onChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? (value.split(',').map(Number) as [number, number]) : null
  );

  useMapEvents({
    click(e) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      onChange(coords.join(','));
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })}
    />
  ) : null;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border">
      <MapContainer
        center={[35.6892, 51.3890]} // تهران
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
