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

// ═══════════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MAP_FRAME_CLASS =
  'w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300';
const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const INPUT_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:border-blue-700 focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// GPS watch window — collect readings for this many ms, pick the best
const GPS_WATCH_DURATION = 15000;

// IP geolocation fallback (free, 1000 req/day)
const IP_GEO_URL = 'https://ipapi.co/json/';

// Fix Leaflet marker icon for Next.js/webpack — use CDN URLs
const MARKER_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ═══════════════════════════════════════════════════════════════════════════════
//  LABELS (en / ar)
// ═══════════════════════════════════════════════════════════════════════════════

const mapLabels: Record<
  Language,
  {
    ariaLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    locateButton: string;
    loadingText: string;
    errorText: string;
    gpsLocating: string;
    gpsFound: string;
    gpsSlow: string;
    ipLocating: string;
    ipFound: string;
    ipWarning: string;
    locationDenied: string;
    locationUnavailable: string;
    noResults: string;
    resolvingAddress: string;
    searchLabel: string;
  }
> = {
  en: {
    ariaLabel: 'Delivery location map',
    searchPlaceholder: 'Search for an address, area, or landmark…',
    searchButton: 'Search',
    locateButton: '📍 Locate Me',
    loadingText: 'Loading map…',
    errorText: 'Failed to load map. Please check your connection.',
    gpsLocating: 'Detecting your precise location via GPS…',
    gpsFound: 'Location found via GPS',
    gpsSlow: 'GPS is taking longer than expected…',
    ipLocating: 'Approximating your location from your network…',
    ipFound: 'Location approximated from your network',
    ipWarning: '⚠️ Approximate location. Drag the pin or search for better accuracy.',
    locationDenied: 'Location access denied. Use search or click the map instead.',
    locationUnavailable: 'Could not determine your location. Please search for your area.',
    noResults: 'No results found. Try a different search term.',
    resolvingAddress: 'Resolving address…',
    searchLabel: 'Search for an address',
  },
  ar: {
    ariaLabel: 'خريطة موقع التوصيل',
    searchPlaceholder: 'ابحث عن عنوان أو منطقة أو معلم…',
    searchButton: 'بحث',
    locateButton: '📍 حدد موقعي',
    loadingText: 'جاري تحميل الخريطة…',
    errorText: 'فشل تحميل الخريطة. يرجى التحقق من اتصالك.',
    gpsLocating: 'جاري تحديد موقعك الدقيق عبر GPS…',
    gpsFound: 'تم تحديد الموقع عبر GPS',
    gpsSlow: 'GPS يستغرق وقتاً أطول من المتوقع…',
    ipLocating: 'جاري تقريب موقعك من الشبكة…',
    ipFound: 'تم تقريب الموقع من الشبكة',
    ipWarning: '⚠️ موقع تقريبي. اسحب العلامة أو ابحث للحصول على دقة أفضل.',
    locationDenied: 'تم رفض الوصول إلى الموقع. استخدم البحث أو اضغط على الخريطة.',
    locationUnavailable: 'تعذر تحديد موقعك. يرجى البحث عن منطقتك.',
    noResults: 'لا توجد نتائج. جرب مصطلح بحث مختلف.',
    resolvingAddress: 'جاري تحديد العنوان…',
    searchLabel: 'ابحث عن عنوان',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PROPS (identical to previous versions — CheckoutPage unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

interface MapAddressPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
  lang?: Language;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  INTERNAL SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

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
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      map.flyTo(position, 15, {
        duration: prefersReducedMotion ? 0 : 0.35,
      });
    }
  }, [triggerPan]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

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

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type LocateSource = 'none' | 'gps' | 'ip' | 'search' | 'click' | 'drag' | 'parent';

export default function MapAddressPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  readOnly = false,
  lang,
}: MapAddressPickerProps) {
  const labels = mapLabels[lang ?? 'en'];

  // ── Refs ──
  const autoLocateCalledRef = useRef(false);
  const isCancelledRef = useRef(false);
  const onLocationSelectRef = useRef(onLocationSelect);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  const gpsSlowTimerRef = useRef<number | null>(null);
  const gpsHardTimerRef = useRef<number | null>(null);

  // ── Derived ──
  const hasInitialPos = initialLat != null && initialLng != null;
  const initialPos: [number, number] = hasInitialPos
    ? [initialLat!, initialLng!]
    : DEFAULT_CENTER;

  // ── State ──
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    hasInitialPos ? [initialLat!, initialLng!] : null,
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialPos);
  const [mounted, setMounted] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [locateState, setLocateState] = useState<
    'idle' | 'locating-gps' | 'gps-slow' | 'locating-ip' | 'found' | 'denied' | 'failed'
  >('idle');
  const [locateSource, setLocateSource] = useState<LocateSource>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [panTrigger, setPanTrigger] = useState(0);
  const [tileLayerFailed, setTileLayerFailed] = useState(false);

  // ── Mount detection ──
  useEffect(() => {
    const mountTimer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(mountTimer);
  }, []);

  // ── Sync when parent updates initialLat/initialLng ──
  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      const pos: [number, number] = [initialLat, initialLng];
      setMarkerPos(pos);
      setMapCenter(pos);
      setLocateSource('parent');
      setPanTrigger((prev) => prev + 1);
      resolveAddress(initialLat, initialLng);
    }
  }, [initialLat, initialLng]);

  // ── Keep callback ref fresh ──
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // ═════════════════════════════════════════════════════════════════════════════
  //  AUTO-LOCATE — watchPosition → collect best reading, then IP fallback
  // ═════════════════════════════════════════════════════════════════════════════
  //
  //  Why watchPosition instead of getCurrentPosition:
  //  - getCurrentPosition returns the FIRST reading (often cached, inaccurate)
  //  - watchPosition fires continuously — accuracy improves over 5-15 seconds
  //  - We pick the BEST reading by accuracy, not the first one
  //  - Same browser permission prompt — user only asked once

  const attemptGPSLocate = useCallback(() => {
    if (!navigator.geolocation) {
      attemptIPLocate();
      return;
    }

    let bestPos: [number, number] | null = null;
    let bestAccuracy = Infinity;
    let gotReading = false;

    setLocateState('locating-gps');
    setLocateSource('gps');

    // "GPS taking longer" banner after 6 seconds
    gpsSlowTimerRef.current = window.setTimeout(() => {
      if (!gotReading) setLocateState('gps-slow');
    }, 6000);

    // Hard timeout — give up GPS and try IP after GPS_WATCH_DURATION
    gpsHardTimerRef.current = window.setTimeout(() => {
      if (gpsWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (bestPos) {
        applyPosition(bestPos, 'gps');
      } else {
        attemptIPLocate();
      }
    }, GPS_WATCH_DURATION);

    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (isCancelledRef.current) return;
        gotReading = true;

        const acc = position.coords.accuracy;
        const pos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        // Track the best reading
        if (acc < bestAccuracy) {
          bestAccuracy = acc;
          bestPos = pos;
        }

        // If we got a really good reading (< 50m), accept immediately
        if (bestAccuracy < 50 && bestPos) {
          if (gpsWatchIdRef.current != null) {
            navigator.geolocation.clearWatch(gpsWatchIdRef.current);
            gpsWatchIdRef.current = null;
          }
          if (gpsSlowTimerRef.current) window.clearTimeout(gpsSlowTimerRef.current);
          if (gpsHardTimerRef.current) window.clearTimeout(gpsHardTimerRef.current);
          applyPosition(bestPos, 'gps');
        }
      },
      (err) => {
        if (isCancelledRef.current) return;
        if (gpsSlowTimerRef.current) window.clearTimeout(gpsSlowTimerRef.current);
        if (gpsHardTimerRef.current) window.clearTimeout(gpsHardTimerRef.current);

        if (err.code === err.PERMISSION_DENIED) {
          setLocateState('denied');
          setLocateSource('none');
        } else {
          attemptIPLocate();
        }
      },
      { enableHighAccuracy: true, timeout: GPS_WATCH_DURATION + 5000, maximumAge: 0 },
    );
  }, []);

  const applyPosition = useCallback((pos: [number, number], source: LocateSource) => {
    setMapCenter(pos);
    setMarkerPos(pos);
    setLocateState('found');
    setLocateSource(source);
    setPanTrigger((prev) => prev + 1);
    onLocationSelectRef.current(pos[0], pos[1]);
    resolveAddress(pos[0], pos[1]);
  }, []);

  const attemptIPLocate = useCallback(async () => {
    setLocateState('locating-ip');
    setLocateSource('ip');

    try {
      const res = await fetch(IP_GEO_URL);
      if (!res.ok) throw new Error('IP geolocation failed');
      const data = await res.json();

      if (data.latitude && data.longitude) {
        const pos: [number, number] = [data.latitude, data.longitude];
        setMapCenter(pos);
        setMarkerPos(pos);
        setLocateState('found');
        setLocateSource('ip');
        setPanTrigger((prev) => prev + 1);
        onLocationSelectRef.current(pos[0], pos[1]);
        resolveAddress(pos[0], pos[1]);
      } else {
        setLocateState('failed');
      }
    } catch {
      setLocateState('failed');
    }
  }, []);

  const handleLocateMe = useCallback(() => {
    // Clean up any existing watch
    if (gpsWatchIdRef.current != null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    if (gpsSlowTimerRef.current) window.clearTimeout(gpsSlowTimerRef.current);
    if (gpsHardTimerRef.current) window.clearTimeout(gpsHardTimerRef.current);
    
    setLocateState('idle');
    setLocateSource('none');
    isCancelledRef.current = false;
    autoLocateCalledRef.current = false;
    attemptGPSLocate();
  }, [attemptGPSLocate]);

  // ── Auto-locate on mount ──
  useEffect(() => {
    if (!mounted || readOnly) return;
    if (hasInitialPos) return;
    if (autoLocateCalledRef.current) return;

    autoLocateCalledRef.current = true;
    isCancelledRef.current = false;
    attemptGPSLocate();

    return () => {
      isCancelledRef.current = true;
      if (gpsWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (gpsSlowTimerRef.current) window.clearTimeout(gpsSlowTimerRef.current);
      if (gpsHardTimerRef.current) window.clearTimeout(gpsHardTimerRef.current);
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═════════════════════════════════════════════════════════════════════════════
  //  ADDRESS RESOLUTION (reverse geocoding)
  // ═════════════════════════════════════════════════════════════════════════════

  const resolveAddress = useCallback(async (lat: number, lng: number) => {
    setResolvingAddress(true);
    setResolvedAddress(null);

    try {
      const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=${lang === 'ar' ? 'ar' : 'en'}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.display_name) {
        setResolvedAddress(data.display_name);
      }
    } catch {
      // Silent — address display is optional
    } finally {
      setResolvingAddress(false);
    }
  }, [lang]);

  // ═════════════════════════════════════════════════════════════════════════════
  //  ADDRESS SEARCH (forward geocoding)
  // ═════════════════════════════════════════════════════════════════════════════

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchError(null);

    try {
      const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=3&accept-language=${lang === 'ar' ? 'ar' : 'en'}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');

      const data: Array<{ lat: string; lon: string; display_name: string }> =
        await res.json();

      if (data.length === 0) {
        setSearchError(labels.noResults);
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const pos: [number, number] = [lat, lng];

      setMarkerPos(pos);
      setMapCenter(pos);
      setLocateSource('search');
      setLocateState('found');
      setPanTrigger((prev) => prev + 1);
      onLocationSelect(lat, lng);
      setResolvedAddress(data[0].display_name);

      // Show the resolved address in the input
      if (searchInputRef.current) {
        searchInputRef.current.value = data[0].display_name;
        setSearchQuery(data[0].display_name);
      }
    } catch {
      setSearchError(labels.errorText);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, onLocationSelect, lang, labels]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  // ═════════════════════════════════════════════════════════════════════════════
  //  MAP HANDLERS
  // ═════════════════════════════════════════════════════════════════════════════

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (readOnly) return;
      setMarkerPos([lat, lng]);
      setLocateSource('click');
      onLocationSelect(lat, lng);
      resolveAddress(lat, lng);
    },
    [readOnly, onLocationSelect, resolveAddress],
  );

  const handleMarkerDragEnd = useCallback(
    (lat: number, lng: number) => {
      if (readOnly) return;
      setMarkerPos([lat, lng]);
      setLocateSource('drag');
      onLocationSelect(lat, lng);
      resolveAddress(lat, lng);
    },
    [readOnly, onLocationSelect, resolveAddress],
  );

  // ═════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════════

  // ── Error state ──
  if (mapError) {
    return (
      <div className={MAP_FRAME_CLASS} role="region" aria-label={labels.ariaLabel}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600 text-sm px-4 text-center gap-2">
          <span className="text-lg">🗺️</span>
          <p className="leading-relaxed">{labels.errorText}</p>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (!mounted) {
    return (
      <div className={MAP_FRAME_CLASS} role="region" aria-label={labels.ariaLabel} aria-busy="true">
        <div className="w-full h-full bg-gray-100 animate-pulse motion-reduce:animate-none flex items-center justify-center text-gray-600 text-sm">
          {labels.loadingText}
        </div>
      </div>
    );
  }

  // ── Status banner ──
  const statusBanner = (() => {
    switch (locateState) {
      case 'locating-gps':
        return (
          <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block shrink-0" />
            {labels.gpsLocating}
          </div>
        );
      case 'gps-slow':
        return (
          <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block shrink-0" />
            {labels.gpsSlow}
          </div>
        );
      case 'locating-ip':
        return (
          <div className="mb-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block shrink-0" />
            {labels.ipLocating}
          </div>
        );
      case 'found':
        if (locateSource === 'ip') {
          return (
            <>
              <div className="mb-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
                {labels.ipFound} ✓
              </div>
              <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                {labels.ipWarning}
              </div>
            </>
          );
        }
        if (locateSource === 'gps') {
          return (
            <div className="mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
              {labels.gpsFound} ✓
            </div>
          );
        }
        if (locateSource === 'search') {
          return null; // Search result — no banner needed, address shows below
        }
        return null;
      case 'denied':
        return (
          <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            {labels.locationDenied}
          </div>
        );
      case 'failed':
        return (
          <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            {labels.locationUnavailable}
          </div>
        );
      default:
        return null;
    }
  })();

  // ── Ready ──
  return (
    <div role="region" aria-label={labels.ariaLabel}>
      {/* ── Controls Row (hidden in readOnly) ── */}
      {!readOnly && (
        <div className="mb-3 space-y-2">
          {/* Search bar + Locate Me button */}
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchLabel}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchError(null);
              }}
              onKeyDown={handleSearchKeyDown}
              className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-600 transition-[border-color,box-shadow] duration-200 ${INPUT_FOCUS_CLASS}`}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className={`px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap ${CONTROL_FOCUS_CLASS}`}
            >
              {searching ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  {lang === 'ar' ? '…' : '…'}
                </span>
              ) : (
                labels.searchButton
              )}
            </button>
          </div>

          {/* Locate Me button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locateState === 'locating-gps' || locateState === 'locating-ip' || locateState === 'gps-slow'}
            className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${CONTROL_FOCUS_CLASS}`}
          >
            {labels.locateButton}
          </button>
        </div>
      )}

      {/* ── Search error ── */}
      {searchError && (
        <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          {searchError}
        </div>
      )}

      {/* ── Location status banners ── */}
      {statusBanner}

      {/* ── Resolved address display ── */}
      {!readOnly && (resolvingAddress || resolvedAddress) && (
        <div className="mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs">
          {resolvingAddress ? (
            <span className="text-gray-500 italic">{labels.resolvingAddress}</span>
          ) : resolvedAddress ? (
            <span className="text-gray-700">{resolvedAddress}</span>
          ) : null}
        </div>
      )}

      {/* ── Coordinates (if no address resolved) ── */}
      {!readOnly && markerPos && !resolvingAddress && !resolvedAddress && locateSource !== 'none' && (
        <div className="mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 font-mono">
          {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
        </div>
      )}

      {/* ── Map ── */}
      <div className={MAP_FRAME_CLASS}>
        <MapContainer
          center={mapCenter}
          zoom={markerPos ? 15 : 12}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          zoomControl={true}
          doubleClickZoom={!readOnly}
          touchZoom={!readOnly}
          attributionControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileLayerFailed
              ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              : 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
            }
            eventHandlers={{
              tileerror: () => {
                if (!tileLayerFailed) {
                  setTileLayerFailed(true);
                } else {
                  setMapError(true);
                }
              },
            }}
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
