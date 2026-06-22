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
  const { heroHeadline, heroImage, heroSubtitle, heroCta } = useSiteContent(lang);

  return (
    <PageHero
      image={heroImage}
      fallbackImage="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000"
      alt={t.pages.hero.imageAlt}
      title={lang === 'en' ? (heroHeadline || 'iCare Beauty') : t.pages.hero.fallbackTitle}
      subtitle={heroSubtitle || undefined}
      ctaLabel={heroCta || t.shopNow}
      onCtaClick={() => onNavigate('shop')}
      priority
    />
  );
};
