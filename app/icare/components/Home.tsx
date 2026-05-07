import React from 'react';
import Marquee from './Marquee';
import { ProductShowcase } from './ProductShowcase';
import { PromoSection } from './PromoSection';
import { ProductGrid } from './ProductSection';
import { CommitmentSection } from './CommitmentSection';
import { SocialGrid } from './SocialGrid';
import { Language, translations } from '../translations';
import { Hero } from './Hero';
import { Product } from '../types';
import { useSiteContent } from '../hooks/useSiteContent';

interface HomeProps {
  onNavigate: (page: string) => void;
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang, onProductSelect }) => {
  const t = translations[lang];
  const { trendingTitle, marqueeText } = useSiteContent();
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero onNavigate={onNavigate} lang={lang} />

      {/* 2. Scrolling Marquee */}
      <Marquee text={lang === 'en' 
        ? marqueeText 
        : "شحن مجاني للطلبات فوق 45$ • لم يختبر على الحيوانات • تم اختباره من قبل أطباء الجلد • نباتي • عناية بالبشرة عالية الأداء •"
      } />

      {/* 3. Featured Product Showcase (Carousel) */}
      <ProductShowcase products={[]} lang={lang} onProductSelect={onProductSelect} />

      {/* 4. New Arrival Promo Section */}
      <PromoSection lang={lang} />

      {/* 5. Trending Products Grid */}
      <div className="py-6 md:py-8 bg-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-3 md:px-10 mb-3 md:mb-8 flex justify-between items-end">
          <h2 className="text-[28px] md:text-[42px] font-black tracking-tight text-[#222] lowercase leading-tight">
            {lang === 'en' ? trendingTitle : 'أساسيات رائجة'}
          </h2>
          <button 
            onClick={() => onNavigate('shop')}
            className="text-[10px] md:text-[12px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition-opacity whitespace-nowrap"
          >
            {t.categories.all}
          </button>
        </div>
        <div className="max-w-[1600px] mx-auto px-0 md:px-10">
          <ProductGrid lang={lang} onProductSelect={onProductSelect} />
        </div>
      </div>

      {/* 6. Commitment / Philosophy Section */}
      <CommitmentSection lang={lang} />

      {/* 7. Social Grid / Community Section */}
      <SocialGrid lang={lang} />

      {/* 8. Spacing before footer */}
      <div className="h-12 md:h-20" />
    </div>
  );
};
