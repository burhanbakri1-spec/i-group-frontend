'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GoogleMap,
  MarkerF,
  Autocomplete,
  useJsApiLoader,
} from '@react-google-maps/api';
import { Language } from '../translations';

// --- Constants ---
const MAP_FRAME_CLASS = 'w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300';
const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const LIBRARIES: 'places'[] = ['places'];

const mapLabels: Record<Language, {
  ariaLabel: string;
  searchPlaceholder: string;
  loadingText: string;
  errorText: string;
  locationDenied: string;
  autoLocated: string;
  locatingText: string;
}> = {
  en: {
    ariaLabel: 'Delivery location map',
    searchPlaceholder: 'Search for an address or place…',
    loadingText: 'Loading map…',
    errorText: 'Failed to load map',
    locationDenied: 'Location access denied. Showing default location.',
    autoLocated: 'Location found',
    locatingText: 'Detecting your location…',
  },
  ar: {
    ariaLabel: 'خريطة موقع التوصيل',
    searchPlaceholder: 'ابحث عن عنوان أو مكان…',
    loadingText: 'جاري تحميل الخريطة…',
    errorText: 'فشل تحميل الخريطة',
    locationDenied: 'تم رفض الوصول إلى الموقع. جاري عرض الموقع الافتراضي.',
    autoLocated: 'تم تحديد الموقع',
    locatingText: 'جاري تحديد موقعك…',
  },
};

// --- Props (unchanged — exact same interface as Leaflet version) ---
interface MapAddressPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
  lang?: Language;
}

export default function MapAddressPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  readOnly = false,
  lang,
}: MapAddressPickerProps) {
  const labels = mapLabels[lang ?? 'en'];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  // --- Load Google Maps script ---
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
    language: lang === 'ar' ? 'ar' : 'en',
  });

  // --- Refs ---
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoLocateCalledRef = useRef(false);
  const isCancelledRef = useRef(false);
  const onLocationSelectRef = useRef(onLocationSelect);

  // --- Initial position ---
  const initialPos: google.maps.LatLngLiteral | null =
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : null;

  // --- State ---
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(
    initialPos ?? CAIRO_CENTER,
  );
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(
    initialPos,
  );
  const [zoom, setZoom] = useState<number>(initialPos ? 15 : 12);
  const [autoLocating, setAutoLocating] = useState(false);
  const [autoLocated, setAutoLocated] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // --- Sync marker + center when parent provides new initialLat/initialLng ---
  // (e.g. user selects a saved address → CheckoutPage updates state → re-render with new props)
  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      const pos = { lat: initialLat, lng: initialLng };
      setMarkerPos(pos);
      setCenter(pos);
      setZoom(15);
      mapRef.current?.panTo(pos);
    }
  }, [initialLat, initialLng]);

  // --- Auto-locate on first mount (only when no initial position is given) ---
  onLocationSelectRef.current = onLocationSelect;

  useEffect(() => {
    if (!isLoaded || readOnly) return;
    if (initialLat != null && initialLng != null) return;
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
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(pos);
        setMarkerPos(pos);
        setZoom(15);
        setAutoLocated(true);
        setAutoLocating(false);
        onLocationSelectRef.current(pos.lat, pos.lng);
        mapRef.current?.panTo(pos);
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
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Callbacks ---
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (readOnly || !e.latLng) return;
      const clickedPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerPos(clickedPos);
      onLocationSelect(clickedPos.lat, clickedPos.lng);
    },
    [readOnly, onLocationSelect],
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (readOnly || !e.latLng) return;
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerPos(newPos);
      onLocationSelect(newPos.lat, newPos.lng);
    },
    [readOnly, onLocationSelect],
  );

  const handleAutocompleteLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    },
    [],
  );

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setCenter(pos);
    setMarkerPos(pos);
    setZoom(16);
    onLocationSelect(pos.lat, pos.lng);
    mapRef.current?.panTo(pos);

    // Reflect the resolved address in the search input so the user sees
    // the actual address instead of the raw typed text
    if (searchInputRef.current) {
      if (!place?.formatted_address && !place?.name) return;
      searchInputRef.current.value = place.formatted_address ?? place.name ?? '';
    }
  }, [onLocationSelect]);

  // --- Error state: Maps script failed to load, or API key missing ---
  if (loadError || !apiKey) {
    return (
      <div className={MAP_FRAME_CLASS} role="region" aria-label={labels.ariaLabel}>
        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 text-sm px-4 text-center leading-relaxed">
          {labels.errorText}
        </div>
      </div>
    );
  }

  // --- Loading state: script is downloading ---
  if (!isLoaded) {
    return (
      <div className={MAP_FRAME_CLASS} role="region" aria-label={labels.ariaLabel} aria-busy="true">
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
          {labels.loadingText}
        </div>
      </div>
    );
  }

  // --- Loaded + ready ---
  return (
    <div role="region" aria-label={labels.ariaLabel}>
      {/* Search Bar (hidden in readOnly mode) */}
      {!readOnly && (
        <div className="mb-3">
          <Autocomplete
            onLoad={handleAutocompleteLoad}
            onPlaceChanged={handlePlaceChanged}
            options={{
              fields: ['geometry', 'formatted_address', 'name'],
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder={labels.searchPlaceholder}
              aria-label="Search for an address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </Autocomplete>
        </div>
      )}

      {/* Location status banners */}
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

      {/* Map */}
      <div className={MAP_FRAME_CLASS}>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={zoom}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
            scrollwheel: true,
            clickableIcons: !readOnly,
            draggableCursor: readOnly ? 'default' : 'grab',
            draggingCursor: readOnly ? 'default' : 'grabbing',
            gestureHandling: readOnly ? 'none' : 'auto',
          }}
        >
          {markerPos && (
            <MarkerF
              position={markerPos}
              draggable={!readOnly}
              onDragEnd={handleMarkerDragEnd}
              animation={1}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
