'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

// مرکز نهاوند
const CENTER: [number, number] = [34.183, 48.355];
const DEFAULT_ZOOM = 11;

export function LocationPickerMap({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<any>(null);
  const markerRef   = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // leaflet فقط در client اجرا می‌شود
    import('leaflet').then(L => {
      // fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center:      CENTER,
        zoom:        DEFAULT_ZOOM,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 },
      ).addTo(map);

      // اگر مختصات از قبل ست بود، مارکر نشان بده
      const initLat = lat ?? CENTER[0];
      const initLng = lng ?? CENTER[1];

      const customIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:32px;height:32px;
          background:#10b981;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 3px 12px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([initLat, initLng], {
        icon: customIcon,
        draggable: true,
      });

      if (lat !== null && lng !== null) {
        marker.addTo(map);
        map.setView([lat, lng], 13);
      }
      markerRef.current = marker;

      // کلیک روی نقشه → مارکر جابجا می‌شه
      map.on('click', (e: any) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        if (!markerRef.current._map) {
          markerRef.current.addTo(map);
        }
        markerRef.current.setLatLng([newLat, newLng]);
        onChange(parseFloat(newLat.toFixed(6)), parseFloat(newLng.toFixed(6)));
      });

      // درگ مارکر → بروز کردن مختصات
      marker.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // وقتی lat/lng از بیرون تغییر کنه (مثلاً ویرایش رکورد) مارکر رو به‌روز کن
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (lat === null || lng === null) return;
    import('leaflet').then(() => {
      markerRef.current.setLatLng([lat, lng]);
      if (!markerRef.current._map) markerRef.current.addTo(mapRef.current);
      mapRef.current.setView([lat, lng], 13, { animate: true });
    });
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm"
        style={{ height: 280 }}
      />
      {/* نمایش مختصات انتخاب‌شده */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        {lat !== null && lng !== null ? (
          <span dir="ltr" className="font-mono text-gray-700">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        ) : (
          <span className="text-gray-400">روی نقشه کلیک کنید تا موقعیت انتخاب شود</span>
        )}
      </div>
    </div>
  );
}
