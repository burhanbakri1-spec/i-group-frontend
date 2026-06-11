import React from 'react';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { PageHero } from './PageHero';

interface HeroProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  const { heroHeadline, heroImage } = useSiteContent();

  return (
    <PageHero
      image={heroImage}
      fallbackImage="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000"
      alt="iCare skincare campaign"
      title={lang === 'en' ? heroHeadline : t.pages.hero.fallbackTitle}
      ctaLabel={t.shopNow}
      onCtaClick={() => onNavigate('shop')}
      priority
    />
  );
};
