import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play } from 'lucide-react';
import { fetchProductMediaVlogs } from '../lib/catalog-client';
import { VlogContentItem } from '../types';

interface VlogPageProps {
  lang: Language;
}

const VlogItem = ({ title, subtitle, image, videoUrl }: { title: string, subtitle: string, image: string, videoUrl?: string | null }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    onClick={() => videoUrl && window.open(videoUrl, '_blank', 'noopener,noreferrer')}
    className="group cursor-pointer"
  >
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#F2F1ED] mb-6">
      <ImageWithFallback 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
          <Play size={20} className="ml-1 fill-black" />
        </div>
      </div>
    </div>
    <div className="space-y-1 px-1">
      <h3 className="text-[14px] md:text-[16px] font-black uppercase tracking-tight">{title}</h3>
      <p className="text-[12px] md:text-[14px] text-black/50 leading-tight">{subtitle}</p>
    </div>
  </motion.div>
);

export const VlogPage: React.FC<VlogPageProps> = ({ lang }) => {
  const [filter, setFilter] = useState('ALL');
  const [remoteVlogs, setRemoteVlogs] = useState<VlogContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    filterBy: lang === 'en' ? 'FILTER BY:' : 'تصفية حسب:',
    all: lang === 'en' ? 'ALL' : 'الكل',
    products: lang === 'en' ? 'PRODUCTS' : 'المنتجات',
    tutorials: lang === 'en' ? 'TUTORIALS' : 'الدروس',
    heroTitle: lang === 'en' ? 'PRODUCT STORIES' : 'قصص المنتجات',
  };

  useEffect(() => {
    const loadVlogs = async () => {
      setLoading(true);
      const items = await fetchProductMediaVlogs(6);
      setRemoteVlogs(items ?? []);
      setLoading(false);
    };
    loadVlogs();
  }, []);

  const vlogs = remoteVlogs ?? [];
  const filteredVlogs = filter === 'ALL' ? vlogs : vlogs.filter((item) => item.category === filter || item.category === 'ALL');

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-32">
      {/* 1. Hero Video Section - Fixed aspect on mobile */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=2000" 
          alt="Hero Vlog" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white p-4">
          <div className="space-y-4 md:space-y-6 text-center">
            <h1 className="text-[16px] md:text-[24px] font-black uppercase tracking-tighter">
              {t.heroTitle}
            </h1>
            <button className="mx-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
              <Play size={20} className="md:w-6 md:h-6 ml-1 fill-white text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar - Desktop Layout Maintained on Mobile */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-row items-center justify-center md:justify-start gap-4 md:gap-6 overflow-x-auto no-scrollbar">
        <span className="text-[10px] md:text-[11px] font-bold text-black/40 uppercase tracking-widest whitespace-nowrap">{t.filterBy}</span>
        <div className="flex gap-2 shrink-0">
          {['ALL', 'PRODUCTS', 'TUTORIALS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === cat ? 'bg-black text-white' : 'bg-[#F2F1ED] text-black/60 hover:bg-[#E5E4E0]'
              }`}
            >
              {lang === 'en' ? cat : (cat === 'ALL' ? t.all : cat === 'PRODUCTS' ? t.products : t.tutorials)}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Vlog Grid - 2 columns even on mobile to match desktop layout */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6">
        {loading ? (
          <div className="py-20 text-center text-[12px] font-black uppercase tracking-[0.2em] text-black/40">Loading stories...</div>
        ) : filteredVlogs.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
            {filteredVlogs.map((vlog) => (
              <VlogItem key={vlog.id} {...vlog} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <h2 className="text-[18px] font-black uppercase tracking-tight text-black/60">
              {lang === 'en' ? 'Vlog content unavailable' : 'محتوى الفلوج غير متاح'}
            </h2>
            <p className="text-[13px] text-black/40 font-medium">
              {lang === 'en' ? 'Product media will appear here when the backend provides it.' : 'سيظهر محتوى المنتجات هنا عند توفره من الخادم.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
