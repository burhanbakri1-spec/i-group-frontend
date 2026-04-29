import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Navigation, ExternalLink } from 'lucide-react';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  distance: string;
  type: 'sephora' | 'boutique' | 'partner';
  status: 'open' | 'closed';
  hours: string;
}

const mockStores: Store[] = [
  {
    id: '1',
    name: 'icare riyadh park',
    address: 'northern ring rd, al aqiq',
    city: 'riyadh',
    zip: '13511',
    distance: '1.2 km',
    type: 'boutique',
    status: 'open',
    hours: '10:00 am - 11:00 pm'
  },
  {
    id: '2',
    name: 'sephora nakheel mall',
    address: 'exit 9, al mughrizat',
    city: 'riyadh',
    zip: '12483',
    distance: '3.5 km',
    type: 'sephora',
    status: 'open',
    hours: '10:00 am - 11:00 pm'
  },
  {
    id: '3',
    name: 'icare red sea mall',
    address: 'king abdulaziz rd, ash shati',
    city: 'jeddah',
    zip: '21146',
    distance: '840 km',
    type: 'boutique',
    status: 'open',
    hours: '10:00 am - 12:00 am'
  },
  {
    id: '4',
    name: 'sephora mall of dhahran',
    address: 'high street, ad dohah al janubiyah',
    city: 'dhahran',
    zip: '34457',
    distance: '390 km',
    type: 'sephora',
    status: 'open',
    hours: '09:30 am - 11:30 pm'
  },
];

interface StoreLocatorProps {
  lang: Language;
}

export const StoreLocator: React.FC<StoreLocatorProps> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'sephora' | 'boutique'>('all');

  const filteredStores = mockStores.filter(store => {
    const matchesSearch = store.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || store.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const t = {
    title: lang === 'en' ? 'where to find us' : 'أماكن تواجدنا',
    searchPlaceholder: lang === 'en' ? 'enter city or zip code' : 'أدخل المدينة أو الرمز البريدي',
    all: lang === 'en' ? 'all locations' : 'جميع الفروع',
    sephora: lang === 'en' ? 'sephora' : 'سيفورا',
    boutique: lang === 'en' ? 'boutiques' : 'بوتيكاتنا',
    directions: lang === 'en' ? 'get directions' : 'الحصول على الاتجاهات',
    hours: lang === 'en' ? 'hours' : 'ساعات العمل',
    open: lang === 'en' ? 'open now' : 'مف��وح الآن',
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
                {lang === 'en' ? 'find icare near you' : 'ابحث عن آي كير بالقرب منك'}
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

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-[#F2F1ED] rounded-full">
              {(['all', 'sephora', 'boutique'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 lg:py-2.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black'
                  }`}
                >
                  {t[tab]}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 no-scrollbar border-t md:border-t-0 border-black/5">
            <div className="space-y-3 pt-4">
              {filteredStores.map((store, index) => (
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
                      <p className="text-[10px] lg:text-[12px] text-black/50 lowercase leading-relaxed">{store.address}, {store.city}</p>
                    </div>
                    <span className="text-[9px] lg:text-[11px] font-bold text-black/30 whitespace-nowrap">{store.distance}</span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[9px] lg:text-[11px] font-bold lowercase text-black/70">{t.open} • {store.hours}</span>
                    </div>
                    
                    <div className="flex gap-2 lg:gap-3 pt-1">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
                        <Navigation size={10} />
                        {t.directions}
                      </button>
                      <button className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center border border-black/10 rounded-full hover:border-black transition-all active:scale-95">
                        <ExternalLink size={12} className="text-black/40" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredStores.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[14px] font-brand lowercase italic text-black/30">no locations found in this area.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-[#F2F1ED] relative overflow-hidden h-[55vh] md:h-full">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1768353088400-d9fcdd222441?q=80&w=2000"
            alt="Store Map"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply grayscale border-t border-black/10 md:border-t-0"
          />
          
          {/* Mock Markers */}
          {filteredStores.map((store, index) => (
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

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 flex flex-col gap-2">
            <button className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-black font-black text-lg lg:text-xl hover:bg-black hover:text-white transition-all">+</button>
            <button className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-black font-black text-lg lg:text-xl hover:bg-black hover:text-white transition-all">−</button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
