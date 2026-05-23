'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: string;
  isActive: boolean;
}

interface StoreLocatorMapProps {
  stores: Store[];
}

const StoreLocatorMap: React.FC<StoreLocatorMapProps> = ({ stores }) => {
  const storeIcon = React.useMemo(
    () =>
      L.divIcon({
        className: 'custom-store-marker',
        html: `<div style="width:32px;height:32px;background:#67645E;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><div style="width:8px;height:8px;background:white;border-radius:50%;"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const center: [number, number] =
    stores.length > 0
      ? [
          stores.reduce((sum, s) => sum + (s.latitude || 0), 0) / stores.length,
          stores.reduce((sum, s) => sum + (s.longitude || 0), 0) / stores.length,
        ]
      : [24.7136, 46.6753];

  return (
    <MapContainer center={center} zoom={11} className="w-full h-full" scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stores.map((store) =>
        store.latitude !== null && store.longitude !== null ? (
          <Marker key={store.id} position={[store.latitude, store.longitude]} icon={storeIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{store.name}</strong>
                <br />
                {store.address}
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
};

export default StoreLocatorMap;
