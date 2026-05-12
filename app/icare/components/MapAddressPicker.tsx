'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Language } from '../translations';

// Use CDN marker icons to avoid Next.js bundler issues with default icon assets
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MAP_PICKER_FRAME_CLASS = 'w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300 mb-4';

const mapLabels: Record<Language, { ariaLabel: string }> = {
  en: { ariaLabel: 'Delivery location map' },
  ar: { ariaLabel: 'خريطة موقع التوصيل' },
};

interface MapAddressPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
  lang?: Language;
}

function RecenterMap({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

function LocationMarker({
  position,
  onLocationSelect,
  readOnly,
}: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function MapAddressPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  readOnly = false,
  lang,
}: MapAddressPickerProps) {
  const defaultCenter: [number, number] = [30.0444, 31.2357]; // Cairo
  const labels = mapLabels[lang ?? 'en'];
  const initialPosition: [number, number] | null =
    initialLat != null && initialLng != null ? [initialLat, initialLng] : null;

  // Memoize the key to avoid full remounting of MapContainer on every render
  // Only remount when the initial position truly changes (saved address selection)
  const mapKey = useMemo(
    () => `map-${initialLat ?? 'null'}-${initialLng ?? 'null'}`,
    [initialLat, initialLng],
  );

  return (
    <div className={MAP_PICKER_FRAME_CLASS} role="region" aria-label={labels.ariaLabel}>
      <MapContainer
        key={mapKey}
        center={initialPosition || defaultCenter}
        zoom={initialPosition ? 15 : 12}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={initialPosition} />
        <LocationMarker
          position={initialPosition}
          onLocationSelect={onLocationSelect}
          readOnly={readOnly}
        />
      </MapContainer>
    </div>
  );
}
