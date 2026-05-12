'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Language } from '../translations';

// --- Constants ---
const MAP_FRAME_CLASS =
  'w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300';
const CAIRO_CENTER: [number, number] = [30.0444, 31.2357];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Fix Leaflet marker icon for Next.js/webpack — use CDN URLs
const MARKER_ICON = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const mapLabels: Record<
  Language,
  {
    ariaLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    loadingText: string;
    errorText: string;
    locationDenied: string;
    autoLocated: string;
    locatingText: string;
  }
> = {
  en: {
    ariaLabel: 'Delivery location map',
    searchPlaceholder: 'Search for an address or place…',
    searchButton: 'Search',
    loadingText: 'Loading map…',
    errorText: 'Failed to load map',
    locationDenied: 'Location access denied. Showing default location.',
    autoLocated: 'Location found',
    locatingText: 'Detecting your location…',
  },
  ar: {
    ariaLabel: 'خريطة موقع التوصيل',
    searchPlaceholder: 'ابحث عن عنوان أو مكان…',
    searchButton: 'بحث',
    loadingText: 'جاري تحميل الخريطة…',
    errorText: 'فشل تحميل الخريطة',
    locationDenied: 'تم رفض الوصول إلى الموقع. جاري عرض الموقع الافتراضي.',
    autoLocated: 'تم تحديد الموقع',
    locatingText: 'جاري تحديد موقعك…',
  },
};

// --- Props (identical to Google Maps version) ---
interface MapAddressPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
  lang?: Language;
}

// ─── Internal sub-components ────────────────────────────────────────────────

/**
 * Handles map click: places/updates the pin at the clicked location.
 */
function MapClickHandler({
  readOnly,
  onClick,
}: {
  readOnly: boolean;
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Receives pan instructions from the parent and flies the map.
 * Only fires when `triggerPan` increments (auto-locate, search, parent sync).
 */
function MapFlyController({
  position,
  triggerPan,
}: {
  position: [number, number] | null;
  triggerPan: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (triggerPan > 0 && position) {
      map.flyTo(position, 15, { duration: 1 });
    }
  }, [triggerPan]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/**
 * A single marker that is optionally draggable.
 */
function PickableMarker({
  position,
  readOnly,
  onDragEnd,
}: {
  position: [number, number];
  readOnly: boolean;
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const handleDragEnd = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const pos = marker.getLatLng();
      onDragEnd(pos.lat, pos.lng);
    },
    [onDragEnd],
  );

  return (
    <Marker
      position={position}
      icon={MARKER_ICON}
      draggable={!readOnly}
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function MapAddressPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  readOnly = false,
  lang,
}: MapAddressPickerProps) {
  const labels = mapLabels[lang ?? 'en'];

  // --- Refs ---
  const autoLocateCalledRef = useRef(false);
  const isCancelledRef = useRef(false);
  const onLocationSelectRef = useRef(onLocationSelect);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Derived ---
  const hasInitialPos = initialLat != null && initialLng != null;
  const initialPos: [number, number] = hasInitialPos
    ? [initialLat!, initialLng!]
    : CAIRO_CENTER;

  // --- State ---
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    hasInitialPos ? [initialLat!, initialLng!] : null,
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialPos);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [autoLocating, setAutoLocating] = useState(false);
  const [autoLocated, setAutoLocated] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [panTrigger, setPanTrigger] = useState(0);

  // --- Mount detection ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Sync when parent updates initialLat/initialLng ---
  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      const pos: [number, number] = [initialLat, initialLng];
      setMarkerPos(pos);
      setMapCenter(pos);
      setPanTrigger((prev) => prev + 1);
    }
  }, [initialLat, initialLng]);

  // --- Auto-locate: same guards as Google Maps version ---
  onLocationSelectRef.current = onLocationSelect;

  useEffect(() => {
    if (!mounted || readOnly) return;
    if (hasInitialPos) return;
    if (autoLocateCalledRef.current) return;

    autoLocateCalledRef.current = true;

    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    isCancelledRef.current = false;
    setAutoLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isCancelledRef.current) return;
        const pos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMapCenter(pos);
        setMarkerPos(pos);
        setAutoLocated(true);
        setAutoLocating(false);
        setPanTrigger((prev) => prev + 1);
        onLocationSelectRef.current(pos[0], pos[1]);
      },
      () => {
        if (isCancelledRef.current) return;
        setLocationDenied(true);
        setAutoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    return () => {
      isCancelledRef.current = true;
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Address search via Nominatim ---
  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      );
      const data: Array<{ lat: string; lon: string; display_name: string }> =
        await res.json();

      if (!res.ok || data.length === 0) return;

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const pos: [number, number] = [lat, lng];

      setMarkerPos(pos);
      setMapCenter(pos);
      setPanTrigger((prev) => prev + 1);
      onLocationSelect(lat, lng);

      // Show the resolved address in the input
      if (searchInputRef.current) {
        searchInputRef.current.value = data[0].display_name;
      }
    } catch {
      // Silently ignore — user can still click the map
    }
  }, [searchQuery, onLocationSelect]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // --- Click handler ---
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (readOnly) return;
      setMarkerPos([lat, lng]);
      onLocationSelect(lat, lng);
    },
    [readOnly, onLocationSelect],
  );

  // --- Drag handler ---
  const handleMarkerDragEnd = useCallback(
    (lat: number, lng: number) => {
      if (readOnly) return;
      setMarkerPos([lat, lng]);
      onLocationSelect(lat, lng);
    },
    [readOnly, onLocationSelect],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Error state ──
  if (error) {
    return (
      <div className={MAP_FRAME_CLASS} role="region" aria-label={labels.ariaLabel}>
        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 text-sm px-4 text-center leading-relaxed">
          {labels.errorText}
        </div>
      </div>
    );
  }

  // ── Loading state (before client-side mount) ──
  if (!mounted) {
    return (
      <div
        className={MAP_FRAME_CLASS}
        role="region"
        aria-label={labels.ariaLabel}
        aria-busy="true"
      >
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
          {labels.loadingText}
        </div>
      </div>
    );
  }

  // ── Ready ──
  return (
    <div role="region" aria-label={labels.ariaLabel}>
      {/* ── Search Bar (hidden in readOnly) ── */}
      {!readOnly && (
        <div className="mb-3 flex gap-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={labels.searchPlaceholder}
            aria-label={
              lang === 'ar'
                ? 'ابحث عن عنوان'
                : 'Search for an address'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            {labels.searchButton}
          </button>
        </div>
      )}

      {/* ── Location status banners ── */}
      {autoLocating && (
        <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
          {labels.locatingText}
        </div>
      )}
      {autoLocated && (
        <div className="mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          {labels.autoLocated} ✓
        </div>
      )}
      {locationDenied && !autoLocating && (
        <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          {labels.locationDenied}
        </div>
      )}

      {/* ── Map ── */}
      <div className={MAP_FRAME_CLASS}>
        <MapContainer
          center={mapCenter}
          zoom={hasInitialPos ? 15 : 12}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          zoomControl={true}
          doubleClickZoom={!readOnly}
          touchZoom={!readOnly}
          attributionControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={TILE_URL}
          />

          <MapClickHandler readOnly={readOnly} onClick={handleMapClick} />

          <MapFlyController position={markerPos} triggerPan={panTrigger} />

          {markerPos && (
            <PickableMarker
              position={markerPos}
              readOnly={readOnly}
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
