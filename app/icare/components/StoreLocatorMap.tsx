'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, ZoomControl } from 'react-leaflet';
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
  selectedStoreId?: string | null;
  onMarkerClick?: (storeId: string) => void;
  getDirectionsUrl?: (store: Store) => string;
}

const WORLD_CENTER: [number, number] = [20, 0];
const WORLD_ZOOM = 2;

function FlyToSelected({ selectedStoreId, stores }: { selectedStoreId: string | null; stores: Store[] }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedStoreId) return;
    const store = stores.find((s) => s.id === selectedStoreId);
    if (store && store.latitude !== null && store.longitude !== null) {
      map.flyTo([store.latitude, store.longitude], 12, { animate: true, duration: 1.2 });
    }
  }, [map, selectedStoreId, stores]);

  return null;
}

const StoreLocatorMap: React.FC<StoreLocatorMapProps> = ({ stores, selectedStoreId, onMarkerClick, getDirectionsUrl }) => {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  const storeIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-store-marker',
        html: `<div class="w-[32px] h-[32px] rounded-full bg-[#67645E] border-[3px] border-white flex items-center justify-center shadow-md"><div class="w-2 h-2 rounded-full bg-white"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const selectedStoreIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-store-marker-selected',
        html: `<div class="w-[36px] h-[36px] rounded-full bg-white border-[4px] border-[#67645E] flex items-center justify-center shadow-lg"><div class="w-3 h-3 rounded-full bg-[#67645E]"></div></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      }),
    []
  );

  const validStores = useMemo(
    () => stores.filter((s) => s.latitude !== null && s.longitude !== null),
    [stores]
  );

  useEffect(() => {
    if (selectedStoreId) {
      const marker = markerRefs.current.get(selectedStoreId);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedStoreId]);

  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={WORLD_ZOOM}
      className="w-full h-full z-0"
      scrollWheelZoom={false}
      zoomControl={false}
      minZoom={2}
      maxZoom={18}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomControl position="topright" />
      <FlyToSelected selectedStoreId={selectedStoreId ?? null} stores={stores} />
      {validStores.map((store) => {
        const isSelected = store.id === selectedStoreId;
        return (
          <Marker
            key={store.id}
            position={[store.latitude!, store.longitude!]}
            icon={isSelected ? selectedStoreIcon : storeIcon}
            eventHandlers={{
              click: () => {
                onMarkerClick?.(store.id);
              },
            }}
            ref={(ref) => {
              if (ref) {
                markerRefs.current.set(store.id, ref);
              } else {
                markerRefs.current.delete(store.id);
              }
            }}
          >
            {/* Permanent label above the marker */}
            <Tooltip
              direction="top"
              offset={[0, -36]}
              opacity={1}
              permanent
              className="bg-transparent border-0 shadow-none text-[11px] font-bold text-[#67645E] whitespace-nowrap"
            >
              {store.name}
            </Tooltip>

            <Popup>
              <div className="text-sm min-w-[200px] space-y-1">
                <p className="font-bold text-gray-900">{store.name}</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {[store.address, store.city, store.country].filter(Boolean).join(', ')}
                </p>
                {getDirectionsUrl && (
                  <a
                    href={getDirectionsUrl(store)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 px-3 py-1.5 bg-[#67645E] text-white text-[11px] font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity"
                  >
                    Get Directions
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default StoreLocatorMap;
