import React from 'react';
import { LandingProductShowcase } from './LandingProductShowcase';
import { ProductShowcase } from './ProductShowcase';
import { PromoSection } from './PromoSection';
import { CommitmentSection } from './CommitmentSection';
import { SocialGrid } from './SocialGrid';
import { PhilosophySection } from './PhilosophySection';
import { Language } from '../translations';
import { Hero } from './Hero';
import { Product } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang, onProductSelect }) => {
  return (
    <div>
      <Hero onNavigate={onNavigate} lang={lang} />

      <LandingProductShowcase lang={lang} onProductSelect={onProductSelect} />

      <PromoSection lang={lang} onNavigate={onNavigate} />

      <PhilosophySection lang={lang} onNavigate={onNavigate} />

      <ProductShowcase products={[]} lang={lang} onProductSelect={onProductSelect} />

      <SocialGrid lang={lang} onNavigate={onNavigate} />

      <CommitmentSection lang={lang} onNavigate={onNavigate} />
    </div>
  );
};
