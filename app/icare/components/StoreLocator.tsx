import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Navigation, ExternalLink } from 'lucide-react';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteContent } from '../hooks/useSiteContent';
import { icareApi, IcareApiError } from '../lib/api-client';
import { BackendStore, PaginatedData } from '../types';

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

const FALLBACK_MAP_IMAGE = 'https://images.unsplash.com/photo-1768353088400-d9fcdd222441?q=80&w=2000';

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
  const { storeLocatorTagline, storeLocatorMapImage, storeLocatorNoResults } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [fetchState, setFetchState] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');

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
  const noResultsText = storeLocatorNoResults?.trim() || (lang === 'en' ? 'no locations found in this area.' : 'لم يتم العثور على مواقع في هذه المنطقة.');

  const t = {
    title: lang === 'en' ? 'where to find us' : 'أماكن تواجدنا',
    searchPlaceholder: lang === 'en' ? 'search by city, address, phone, or email' : 'ابحث بالمدينة أو العنوان أو الهاتف أو البريد',
    directions: lang === 'en' ? 'get directions' : 'الحصول على الاتجاهات',
    contact: lang === 'en' ? 'contact' : 'التواصل',
    open: lang === 'en' ? 'open now' : 'مفتوح الآن',
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-24 pb-8 md:pb-0 overflow-hidden">
      <div className="flex flex-col md:flex-row h-[calc(100vh-96px)]">
        
        {/* Sidebar: List */}
        <div className="w-full md:w-[320px] lg:w-[450px] flex flex-col border-r border-black/5 h-[45vh] md:h-full overflow-hidden bg-white z-10 shadow-xl md:shadow-none">
          <div className="p-4 lg:p-8 space-y-4 lg:space-y-8">
            <header>
              <h1 className="text-[24px] lg:text-[42px] font-brand lowercase italic leading-none mb-1 lg:mb-2">{t.title}</h1>
              <p className="text-[9px] lg:text-[11px] font-bold uppercase tracking-widest text-black/40">
                {lang === 'en' ? storeLocatorTagline : 'ابحث عن آي كير بالقرب منك'}
              </p>
            </header>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
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
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {fetchState === 'error' && (
                <div className="text-center py-20 space-y-4">
                  <p className="text-[14px] font-brand lowercase italic text-black/30">
                    {lang === 'en' ? 'Unable to load store locations.' : 'تعذر تحميل مواقع المتاجر.'}
                  </p>
                  <button
                    onClick={loadStores}
                    className="text-[9px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-all"
                  >
                    {lang === 'en' ? 'retry' : 'إعادة المحاولة'}
                  </button>
                </div>
              )}

              {fetchState === 'empty' && (
                <div className="text-center py-20">
                  <p className="text-[14px] font-brand lowercase italic text-black/30">
                    {noResultsText}
                  </p>
                </div>
              )}

              {fetchState === 'success' && filteredStores.map((store, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={store.id}
                  className="group p-4 lg:p-6 rounded-[16px] lg:rounded-[24px] border border-black/5 hover:border-black transition-all cursor-pointer bg-white"
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
                        {t.open}{store.openingHours ? ` • ${store.openingHours}` : ''}
                      </span>
                    </div>

                    {(store.phone || store.email) && (
                      <p className="text-[9px] lg:text-[11px] font-bold lowercase text-black/50">
                        {t.contact}: {[store.phone, store.email].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    
                    <div className="flex gap-2 lg:gap-3 pt-1">
                      <a
                        href={getDirectionsUrl(store)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                      >
                        <Navigation size={10} />
                        {t.directions}
                      </a>
                      <a
                        href={getDirectionsUrl(store)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${store.name} Google Maps`}
                        className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center border border-black/10 rounded-full hover:border-black transition-all active:scale-95"
                      >
                        <ExternalLink size={12} className="text-black/40" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}

              {fetchState === 'success' && filteredStores.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[14px] font-brand lowercase italic text-black/30">
                    {noResultsText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-[#F2F1ED] relative overflow-hidden h-[55vh] md:h-full">
          <ImageWithFallback
            src={storeLocatorMapImage || FALLBACK_MAP_IMAGE}
            alt="Store Map"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply grayscale border-t border-black/10 md:border-t-0"
          />
          
          {/* Map Markers */}
          {fetchState === 'success' && filteredStores.map((store, index) => (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: index * 0.2 }}
              key={`marker-${store.id}`}
              className="absolute pointer-events-none"
              style={{
                top: `${25 + (index * 12)}%`,
                left: `${35 + (index * 8)}%`,
              }}
            >
              <div className="relative flex flex-col items-center">
                <div className="bg-black text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-tighter mb-1.5 lg:mb-2 whitespace-nowrap shadow-2xl">
                  {store.name}
                </div>
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-black rounded-full border-[3px] lg:border-4 border-white shadow-xl flex items-center justify-center">
                  <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full animate-ping" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
