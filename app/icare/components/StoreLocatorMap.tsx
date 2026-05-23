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

            <Popup className="store-popup">
              <div
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    const dirUrl = getDirectionsUrl ? getDirectionsUrl(store) : null;
                    const addr = [store.address, store.city, store.country].filter(Boolean).join(', ');

                    const label = (key: string, val: string) =>
                      `<div style="display:flex;gap:6px;margin-bottom:3px;font-size:12px;line-height:1.5">
                        <span style="color:#888;flex-shrink:0;font-weight:500">${key}:</span>
                        <span style="color:#1a1a1a">${val}</span>
                      </div>`;

                    return `
                      <div style="min-width:200px;font-family:sans-serif;padding:2px">
                        <p style="margin:0 0 8px;font-weight:800;font-size:14px;color:#1a1a1a;line-height:1.3">${store.name}</p>
                        ${store.address ? label('address', store.address) : ''}
                        ${store.city    ? label('city',    store.city)    : ''}
                        ${store.country ? label('country', store.country) : ''}
                        ${dirUrl
                          ? `<a
                              href="${dirUrl}"
                              target="_blank"
                              rel="noreferrer"
                              style="display:inline-block;margin-top:8px;padding:6px 14px;background:#67645E;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;border-radius:999px;text-decoration:none;white-space:nowrap"
                            >Get Directions</a>`
                          : ''}
                      </div>
                    `;
                  })(),
                }}
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default StoreLocatorMap;
