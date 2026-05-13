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
const DEFAULT_CENTER: [number, number] = [0, 0];

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// GPS — try high-accuracy (phone) first, then low-accuracy (desktop WiFi positioning)
const GPS_TRY_DURATION = 5000;
const WIFI_TRY_DURATION = 8000;

// IP geolocation — try multiple services
const IP_SERVICES = [
  'https://ipinfo.io/json',
  'https://ipapi.co/json/',
];

// Tile layers — street + satellite (ESRI, free, no key)
const TILES_STREET = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILES_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const TILES_ATTRIB_STREET = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const TILES_ATTRIB_SAT = '&copy; <a href="https://www.esri.com/">Esri</a>';

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
    wifiLocating: string;
    wifiFound: string;
    ipLocating: string;
    ipFound: string;
    ipWarning: string;
    locationDenied: string;
    locationUnavailable: string;
    noResults: string;
    resolvingAddress: string;
    searchLabel: string;
    googleMapsButton: string;
    googleMapsHelp: string;
    googleMapsPasteLabel: string;
    googleMapsPlaceholder: string;
    googleMapsSet: string;
    googleMapsParsed: string;
    mapLayer: string;
    satelliteLayer: string;
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
    wifiLocating: 'Locating via WiFi networks…',
    wifiFound: 'Location found via WiFi positioning',
    ipLocating: 'Approximating your location from your network…',
    ipFound: 'Location approximated from your network',
    ipWarning: '⚠️ Approximate location. Drag the pin or search for better accuracy.',
    locationDenied: 'Location access denied. Use search or click the map instead.',
    googleMapsButton: '📍 Select on Google Maps ↗',
    googleMapsHelp: '1. Find your location on Google Maps → drop a pin → tap Share → Copy link\n2. Paste the link below',
    googleMapsPasteLabel: 'Paste Google Maps link or coordinates',
    googleMapsPlaceholder: 'Paste link or paste coordinates like 30.0444,31.2357…',
    googleMapsSet: 'Set Location',
    googleMapsParsed: 'Parsed location: ',
    mapLayer: 'Map',
    satelliteLayer: 'Satellite',
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
    wifiLocating: 'جاري تحديد الموقع عبر شبكات WiFi…',
    wifiFound: 'تم تحديد الموقع عبر شبكات WiFi',
    ipLocating: 'جاري تقريب موقعك من الشبكة…',
    ipFound: 'تم تقريب الموقع من الشبكة',
    ipWarning: '⚠️ موقع تقريبي. اسحب العلامة أو ابحث للحصول على دقة أفضل.',
    locationDenied: 'تم رفض الوصول إلى الموقع. استخدم البحث أو اضغط على الخريطة.',
    locationUnavailable: 'تعذر تحديد موقعك. يرجى البحث عن منطقتك.',
    noResults: 'لا توجد نتائج. جرب مصطلح بحث مختلف.',
    resolvingAddress: 'جاري تحديد العنوان…',
    searchLabel: 'ابحث عن عنوان',
    googleMapsButton: '📍 اختر على خرائط جوجل ↗',
    googleMapsHelp: '١. ابحث عن موقعك على خرائط جوجل ← ضع علامة ← اضغط مشاركة ← نسخ الرابط\n٢. الصق الرابط أدناه',
    googleMapsPasteLabel: 'الصق رابط خرائط جوجل أو الإحداثيات',
    googleMapsPlaceholder: 'الصق الرابط أو الإحداثيات مثل 30.0444,31.2357…',
    googleMapsSet: 'تحديد الموقع',
    googleMapsParsed: 'الموقع المستخرج: ',
    mapLayer: 'خريطة',
    satelliteLayer: 'قمر صناعي',
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
    'idle' | 'locating-gps' | 'locating-wifi' | 'locating-ip' | 'found' | 'denied' | 'failed'
  >('idle');
  const [locateSource, setLocateSource] = useState<LocateSource>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [panTrigger, setPanTrigger] = useState(0);
  const [tileLayerFailed, setTileLayerFailed] = useState(false);
  const [satelliteView, setSatelliteView] = useState(true);

  // Google Maps paste flow
  const [googleMapsOpen, setGoogleMapsOpen] = useState(false);
  const [googleMapsInput, setGoogleMapsInput] = useState('');
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

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
  //  AUTO-LOCATE — two-phase: GPS (phones) → WiFi (desktops) → IP (fallback)
  // ═════════════════════════════════════════════════════════════════════════════
  //
  //  Phones have dedicated GPS chips → fast, accurate
  //  Desktops have no GPS → rely on WiFi positioning (Google's WiFi DB)
  //  We try GPS first (fast on phones), then WiFi (desktops), then IP (last resort)

  const attemptLocate = useCallback((phase: 'gps' | 'wifi') => {
    if (!navigator.geolocation) {
      attemptIPLocate();
      return;
    }

    let bestPos: [number, number] | null = null;
    let bestAccuracy = Infinity;
    let gotReading = false;

    const isGps = phase === 'gps';
    setLocateState(isGps ? 'locating-gps' : 'locating-wifi');
    setLocateSource('gps');

    const duration = isGps ? GPS_TRY_DURATION : WIFI_TRY_DURATION;

    const settleTimer = window.setTimeout(() => {
      if (gpsWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (bestPos) {
        applyPosition(bestPos, 'gps');
      } else if (isGps) {
        // GPS gave nothing → try WiFi positioning
        attemptLocate('wifi');
      } else {
        // WiFi also gave nothing → try IP
        attemptIPLocate();
      }
    }, duration);

    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (isCancelledRef.current) return;
        gotReading = true;

        const acc = position.coords.accuracy;
        const pos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        if (acc < bestAccuracy) {
          bestAccuracy = acc;
          bestPos = pos;
        }

        // Good reading (< 50m GPS or < 200m WiFi) → accept immediately
        const goodEnough = isGps ? bestAccuracy < 50 : bestAccuracy < 200;
        if (goodEnough && bestPos) {
          if (gpsWatchIdRef.current != null) {
            navigator.geolocation.clearWatch(gpsWatchIdRef.current);
            gpsWatchIdRef.current = null;
          }
          window.clearTimeout(settleTimer);
          applyPosition(bestPos, 'gps');
        }
      },
      (err) => {
        if (isCancelledRef.current) return;
        window.clearTimeout(settleTimer);

        if (err.code === err.PERMISSION_DENIED) {
          setLocateState('denied');
          setLocateSource('none');
        } else if (isGps) {
          attemptLocate('wifi');
        } else {
          attemptIPLocate();
        }
      },
      {
        enableHighAccuracy: isGps,
        timeout: duration + 2000,
        maximumAge: 0,
      },
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

    for (const url of IP_SERVICES) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const lat = data.lat ?? data.latitude;
        const lng = data.lon ?? data.longitude ?? data.lng;
        if (lat && lng) {
          const pos: [number, number] = [lat, lng];
          setMapCenter(pos);
          setMarkerPos(pos);
          setLocateState('found');
          setLocateSource('ip');
          setPanTrigger((prev) => prev + 1);
          onLocationSelectRef.current(pos[0], pos[1]);
          resolveAddress(pos[0], pos[1]);
          return;
        }
      } catch {
        continue;
      }
    }
    setLocateState('failed');
  }, []);

  const handleLocateMe = useCallback(() => {
    // Clean up any existing watch
    if (gpsWatchIdRef.current != null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }

    setLocateState('idle');
    setLocateSource('none');
    isCancelledRef.current = false;
    autoLocateCalledRef.current = false;
    attemptLocate('gps');
  }, [attemptLocate]);

  // ── Auto-locate on mount ──
  useEffect(() => {
    if (!mounted || readOnly) return;
    if (hasInitialPos) return;
    if (autoLocateCalledRef.current) return;

    autoLocateCalledRef.current = true;
    isCancelledRef.current = false;
    attemptLocate('gps');

    return () => {
      isCancelledRef.current = true;
      if (gpsWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
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
  //  GOOGLE MAPS — open in new tab, paste link back, parse coordinates
  // ═════════════════════════════════════════════════════════════════════════════

  const handleGoogleMapsOpen = useCallback(() => {
    // Open Google Maps centered on current pin, or let Google Maps detect the user
    const currentLat = markerPos?.[0];
    const currentLng = markerPos?.[1];
    const url =
      currentLat != null && currentLng != null
        ? `https://www.google.com/maps?q=${currentLat},${currentLng}`
        : 'https://www.google.com/maps';
    window.open(url, '_blank');
    setGoogleMapsOpen(true);
  }, [markerPos]);

  const handleGoogleMapsPaste = useCallback(() => {
    setGoogleMapsError(null);
    const raw = googleMapsInput.trim();
    if (!raw) return;

    // Try to extract coordinates from various formats:
    // - "@lat,lng,zoom" from Google Maps URLs
    // - "q=lat,lng" from query params
    // - Raw "lat, lng" input
    let lat: number | null = null;
    let lng: number | null = null;

    // Pattern 1: @lat,lng,zoom (most common in Google Maps share links)
    const atMatch = raw.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (atMatch) {
      lat = parseFloat(atMatch[1]);
      lng = parseFloat(atMatch[2]);
    }

    // Pattern 2: q=lat,lng (query parameter format)
    if (lat === null) {
      const qMatch = raw.match(/[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (qMatch) {
        lat = parseFloat(qMatch[1]);
        lng = parseFloat(qMatch[2]);
      }
    }

    // Pattern 3: Raw "lat, lng" or "lat lng" (user just types coordinates)
    if (lat === null) {
      const rawMatch = raw.match(/^(-?\d+\.?\d*)\s*[, :]\s*(-?\d+\.?\d*)$/);
      if (rawMatch) {
        lat = parseFloat(rawMatch[1]);
        lng = parseFloat(rawMatch[2]);
      }
    }

    // Validate
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      setGoogleMapsError(lang === 'ar' ? 'تعذر استخراج الإحداثيات. تأكد من نسخ الرابط الصحيح.' : 'Could not extract coordinates. Make sure you copied the correct link.');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setGoogleMapsError(lang === 'ar' ? 'الإحداثيات غير صالحة' : 'Invalid coordinates');
      return;
    }

    const pos: [number, number] = [lat, lng];
    setGoogleMapsOpen(false);
    setGoogleMapsInput('');
    setMarkerPos(pos);
    setMapCenter(pos);
    setLocateState('found');
    setLocateSource('search');
    setPanTrigger((prev) => prev + 1);
    onLocationSelect(lat, lng);
    resolveAddress(lat, lng);
  }, [googleMapsInput, onLocationSelect, resolveAddress, lang]);

  // ═════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════════

  // ── Map error ──
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
      case 'locating-wifi':
        return (
          <div className="mb-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block shrink-0" />
            {labels.wifiLocating}
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
            disabled={locateState === 'locating-gps' || locateState === 'locating-wifi' || locateState === 'locating-ip'}
            className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${CONTROL_FOCUS_CLASS}`}
          >
            {labels.locateButton}
          </button>

          {/* Select on Google Maps ↗ button */}
          <button
            type="button"
            onClick={handleGoogleMapsOpen}
            className={`w-full px-4 py-2 bg-white border border-dashed border-blue-400 rounded-lg text-sm text-blue-700 hover:bg-blue-50 transition-colors ${CONTROL_FOCUS_CLASS}`}
          >
            {labels.googleMapsButton}
          </button>

          {/* Paste area (shown after button is clicked) */}
          {googleMapsOpen && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-blue-800 whitespace-pre-line leading-relaxed">
                {labels.googleMapsHelp}
              </p>
              <label className="block text-xs font-medium text-blue-800">
                {labels.googleMapsPasteLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleMapsInput}
                  onChange={(e) => { setGoogleMapsInput(e.target.value); setGoogleMapsError(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGoogleMapsPaste(); }}
                  placeholder={labels.googleMapsPlaceholder}
                  className={`flex-1 px-3 py-2 border border-blue-300 rounded text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${INPUT_FOCUS_CLASS}`}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleGoogleMapsPaste}
                  disabled={!googleMapsInput.trim()}
                  className={`px-3 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap ${CONTROL_FOCUS_CLASS}`}
                >
                  {labels.googleMapsSet}
                </button>
              </div>
              {googleMapsError && (
                <p className="text-xs text-red-600">{googleMapsError}</p>
              )}
            </div>
          )}
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

      {/* ── Layer toggle ── */}
      {!readOnly && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setSatelliteView(!satelliteView)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              satelliteView
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            } ${CONTROL_FOCUS_CLASS}`}
          >
            {satelliteView ? labels.satelliteLayer : labels.mapLayer}
          </button>
        </div>
      )}

      {/* ── Map ── */}
      <div className={MAP_FRAME_CLASS}>
        <MapContainer
          center={mapCenter}
          zoom={markerPos ? 15 : 2}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          zoomControl={true}
          doubleClickZoom={!readOnly}
          touchZoom={!readOnly}
          attributionControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution={satelliteView ? TILES_ATTRIB_SAT : TILES_ATTRIB_STREET}
            url={satelliteView ? TILES_SATELLITE : TILES_STREET}
            eventHandlers={{
              tileerror: () => {
                if (satelliteView) {
                  // Satellite tiles failed → silently fall back to street
                  setSatelliteView(false);
                } else if (tileLayerFailed) {
                  setMapError(true);
                } else {
                  setTileLayerFailed(true);
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
