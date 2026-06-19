'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const NAHAVAND: [number, number] = [34.183, 48.355];

const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:40px;display:flex;flex-direction:column;align-items:center;cursor:pointer;
  ">
    <div style="
      width:32px;height:32px;background:#2563EB;border-radius:50% 50% 50% 0;
      border:3px solid white;box-shadow:0 3px 14px rgba(0,0,0,0.35);
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
    ">
      <div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);"></div>
    </div>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

function FlyToSelected({ latlng }: { latlng: { lat: number; lng: number } | null }) {
  const map = useMap();
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (!latlng) return;
    const key = `${latlng.lat},${latlng.lng}`;
    if (key !== prev.current) {
      map.flyTo([latlng.lat, latlng.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
      prev.current = key;
    }
  }, [latlng, map]);
  return null;
}

function ClickHandler({ onSelect }: { onSelect: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

interface MapComponentProps {
  center?: { lat: number; lng: number };
  onLocationSelect: (latlng: { lat: number; lng: number }) => void;
  selectedLocation: { lat: number; lng: number } | null;
  height?: string;
}

export default function MapComponent({
  center,
  onLocationSelect,
  selectedLocation,
  height = '280px',
}: MapComponentProps) {
  const initialCenter: [number, number] = center
    ? [center.lat, center.lng]
    : NAHAVAND;

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
          subdomains="abcd"
          maxZoom={19}
          keepBuffer={4}
          updateWhenIdle={false}
          detectRetina
          crossOrigin="anonymous"
        />
        <ClickHandler onSelect={onLocationSelect} />
        <FlyToSelected latlng={selectedLocation} />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={PIN_ICON} />
        )}
      </MapContainer>
    </div>
  );
}
