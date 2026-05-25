import React from 'react';
import { ProductShowcase } from './ProductShowcase';
import { PromoSection } from './PromoSection';
import { ProductGrid } from './ProductSection';
import { CommitmentSection } from './CommitmentSection';
import { SocialGrid } from './SocialGrid';
import { PhilosophySection } from './PhilosophySection';
import { Language } from '../translations';
import { Hero } from './Hero';
import { Product } from '../types';
import { useSiteContent } from '../hooks/useSiteContent';

interface HomeProps {
  onNavigate: (page: string) => void;
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang, onProductSelect }) => {
  const { trendingTitle } = useSiteContent();
  return (
    <div>
      <Hero onNavigate={onNavigate} lang={lang} />

      <section className="icare-index-section icare-product-rail-section">
        <div className="sr-only">
          <span className="hidden text-[12px] font-bold uppercase leading-[1.5] text-[#67645E] md:block">
            {lang === 'en' ? 'swipe' : 'اسحب'}
          </span>
          <h2 className="text-[clamp(2rem,5vw,2.5rem)] font-black tracking-[-0.04em] text-[#67645E] lowercase leading-none">
            {lang === 'en' ? trendingTitle : 'أساسيات رائجة'}
          </h2>
        </div>
        <ProductGrid lang={lang} onProductSelect={onProductSelect} />
      </section>

      <PromoSection lang={lang} onNavigate={onNavigate} />

      <PhilosophySection lang={lang} onNavigate={onNavigate} />

      <ProductShowcase products={[]} lang={lang} onProductSelect={onProductSelect} />

      <SocialGrid lang={lang} onNavigate={onNavigate} />

      <CommitmentSection lang={lang} onNavigate={onNavigate} />
    </div>
  );
};
