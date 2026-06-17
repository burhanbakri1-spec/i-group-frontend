import React, { useState, useEffect, useCallback } from 'react';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { Search, Navigation, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import { translations, Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { useContent } from '../hooks/useContent';
import { icareApi, IcareApiError } from '../lib/api-client';
import { BackendStore, PaginatedData } from '../types';
import { StoreLocatorSkeleton } from './ui/skeletons';

// Leaflet map — client-side only
import 'leaflet/dist/leaflet.css';

const StoreLocatorMap = dynamic(() => import('./StoreLocatorMap'), { ssr: false });

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

interface StoreLocatorProps {
  lang: Language;
}

const isPaginatedStoreResponse = (value: PaginatedData<BackendStore> | BackendStore[]): value is PaginatedData<BackendStore> => (
  !Array.isArray(value) && Array.isArray(value.data)
);

const normalizeOpeningHours = (value: BackendStore['openingHours'] | BackendStore['hours']) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(' • ');
  return value ?? '';
};

const normalizeCoordinate = (value: BackendStore['latitude']) => {
  if (value === null || value === undefined || value === '') return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const normalizeIsActive = (value: BackendStore['isActive']) => value === undefined || value === null || value === true || value === 'true' || value === 1 || value === '1';

const normalizeStores = (response: PaginatedData<BackendStore> | BackendStore[]): Store[] => {
  const rawStores = isPaginatedStoreResponse(response) ? response.data : response;
  return rawStores
    .map((item, index) => ({
      id: String(item.id ?? index),
      name: item.name ?? item.title ?? 'store',
      address: item.address ?? '',
      city: item.city ?? '',
      country: item.country ?? '',
      phone: item.phone ?? '',
      email: item.email ?? '',
      latitude: normalizeCoordinate(item.latitude ?? item.lat),
      longitude: normalizeCoordinate(item.longitude ?? item.lng),
      openingHours: normalizeOpeningHours(item.openingHours ?? item.hours),
      isActive: normalizeIsActive(item.isActive),
    }))
    .filter((store) => store.isActive);
};

const getDirectionsUrl = (store: Store) => {
  if (store.latitude !== null && store.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
  }
  const destination = encodeURIComponent([store.address, store.city, store.country].filter(Boolean).join(', '));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

const matchesStoreSearch = (store: Store, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [store.name, store.address, store.city, store.country, store.phone, store.email]
    .some((value) => value.toLowerCase().includes(normalizedQuery));
};

const fetchActiveStores = async () => normalizeStores(await icareApi.stores.list({ isActive: true }));

export const StoreLocator: React.FC<StoreLocatorProps> = ({ lang }) => {
  const { storeLocatorTagline, storeLocatorNoResults } = useSiteContent(lang);
  // ContentProvider overrides — 3 marketing keys.
  const { val: storeLocatorTaglineCp } = useContent('marketing.store.locator.tagline', { lang, fallback: '' });
  const { val: storeLocatorNoResultsCp } = useContent('marketing.store.locator.no.results', { lang, fallback: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [fetchState, setFetchState] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const loadStores = async () => {
    setFetchState('loading');
    try {
      const nextStores = await fetchActiveStores();
      setStores(nextStores);
      setFetchState(nextStores.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.warn('StoreLocator: failed to load stores.', err instanceof IcareApiError ? err.message : err);
      setStores([]);
      setFetchState('error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadInitialStores = async () => {
      setFetchState('loading');
      try {
        const nextStores = await fetchActiveStores();
        if (cancelled) return;
        setStores(nextStores);
        setFetchState(nextStores.length > 0 ? 'success' : 'empty');
      } catch (err) {
        if (cancelled) return;
        console.warn('StoreLocator: failed to load stores.', err instanceof IcareApiError ? err.message : err);
        setStores([]);
        setFetchState('error');
      }
    };
    loadInitialStores();
    return () => { cancelled = true; };
  }, []);

  const filteredStores = stores.filter((store) => matchesStoreSearch(store, searchQuery));
  const t = translations[lang];
  const noResultsText = storeLocatorNoResultsCp || storeLocatorNoResults?.trim() || t.pages.storeLocator.noResults;

  const handleStoreClick = useCallback((storeId: string) => {
    setSelectedStoreId(storeId);
    const element = document.getElementById(`store-card-${storeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F0ED] overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row h-[calc(100vh-96px)]">

        {/* Sidebar: List */}
        <div className="w-full md:w-[320px] lg:w-[450px] flex flex-col border-r border-[#DDDDDD] h-[45vh] md:h-full overflow-hidden bg-white z-10">
          <div className="p-4 lg:p-8 space-y-4 lg:space-y-8">
            <header>
              <h1 className="text-[24px] lg:text-[42px] font-brand lowercase italic leading-none mb-1 lg:mb-2">{t.pages.storeLocator.title}</h1>
              <p className="text-[9px] lg:text-[11px] font-bold uppercase tracking-widest text-black/40">
                {storeLocatorTaglineCp || storeLocatorTagline || t.pages.storeLocator.tagline}
              </p>
            </header>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t.pages.storeLocator.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 lg:h-14 pl-10 pr-4 bg-[#F2F1ED] rounded-full text-[12px] lg:text-[14px] font-bold lowercase placeholder:text-black/30 outline-none focus:ring-2 ring-black/5 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={14} />
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 no-scrollbar border-t md:border-t-0 border-black/5">
            <div className="space-y-3 pt-4">
              {fetchState === 'loading' && (
                <StoreLocatorSkeleton count={4} />
              )}

              {fetchState === 'error' && (
                <div className="text-center py-20 space-y-4">
                  <p className="text-[14px] font-brand lowercase italic text-black/30">
                    {t.pages.storeLocator.unableToLoad}
                  </p>
                  <button
                    onClick={loadStores}
                    className="text-[9px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-all"
                  >
                    {t.pages.storeLocator.retry}
                  </button>
                </div>
              )}

              {fetchState === 'empty' && (
                <div className="text-center py-20">
                  <p className="text-[14px] font-brands lowercase italic text-black/30">
                    {noResultsText}
                  </p>
                </div>
              )}

              {fetchState === 'success' && (
                <StaggerContainer staggerDelay={0.08} viewportMargin="-40px">
                  {filteredStores.map((store, index) => (
                    <ScrollReveal key={store.id} direction="bottom" delay={index * 0.08}>
                      <div
                        onClick={() => handleStoreClick(store.id)}
                        className={`group p-4 lg:p-6 rounded-[16px] lg:rounded-[24px] border cursor-pointer bg-white transition-all ${
                          selectedStoreId === store.id
                            ? 'border-black shadow-md'
                            : 'border-black/5 hover:border-black'
                        }`}
                      >
                  <div className="flex justify-between items-start mb-2 lg:mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-[14px] lg:text-[18px] font-black lowercase mb-1 group-hover:italic transition-all">{store.name}</h3>
                      <p className="text-[10px] lg:text-[12px] text-black/50 lowercase leading-relaxed">
                        {[store.address, store.city, store.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[9px] lg:text-[11px] font-bold lowercase text-black/70">
                        {t.pages.storeLocator.open}{store.openingHours ? ` • ${store.openingHours}` : ''}
                      </span>
                    </div>

                    {(store.phone || store.email) && (
                      <p className="text-[9px] lg:text-[11px] font-bold lowercase text-black/50">
                        {t.pages.storeLocator.contact}: {[store.phone, store.email].filter(Boolean).join(' • ')}
                      </p>
                    )}

                    <div className="flex gap-2 lg:gap-3 pt-1">
                      <a
                        href={getDirectionsUrl(store)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#67645E] text-white rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                      >
                        <Navigation size={10} />
                        {t.pages.storeLocator.directions}
                      </a>
                      <a
                        href={getDirectionsUrl(store)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${store.name} Google Maps`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center border border-black/10 rounded-full hover:border-black transition-all active:scale-95"
                      >
                        <ExternalLink size={12} className="text-black/40" />
                      </a>
                    </div>
                  </div>
                  </div>
                </ScrollReveal>
              ))}
            </StaggerContainer>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden h-[55vh] md:h-full">
          <StoreLocatorMap
            stores={filteredStores}
            selectedStoreId={selectedStoreId}
            onMarkerClick={handleStoreClick}
            getDirectionsUrl={getDirectionsUrl}
          />
          {fetchState === 'loading' && (
            <div className="absolute inset-0 bg-[#F2F1ED]/70 flex items-center justify-center z-[400] pointer-events-none">
              <p className="text-sm text-black/30 font-medium">
                {t.pages.storeLocator.loadingMap}
              </p>
            </div>
          )}
          {fetchState === 'error' && (
            <div className="absolute inset-0 bg-[#F2F1ED]/70 flex items-center justify-center z-[400] pointer-events-none">
              <p className="text-sm text-black/30 font-medium">
                {t.pages.storeLocator.mapUnavailable}
              </p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
