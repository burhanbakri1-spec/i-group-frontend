import React from 'react';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { useContent } from '../hooks/useContent';
import { PageHero } from './PageHero';

interface HeroProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  const { heroHeadline, heroImage } = useSiteContent(lang);
  // ContentProvider key — BE provides Unsplash default via
  // HeroService.onModuleInit() (registered in e-commerce-backend).
  const { val: homeHeroImageCp } = useContent('home.hero.image', { lang, fallback: '' });
  const { val: homeHeroHeadlineCp } = useContent('home.hero.headline', { lang, fallback: '' });

  return (
    <PageHero
      image={homeHeroImageCp || heroImage}
      fallbackImage="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000"
      alt={t.pages.hero.imageAlt}
      title={lang === 'en' ? (homeHeroHeadlineCp || heroHeadline) : t.pages.hero.fallbackTitle}
      ctaLabel={t.shopNow}
      onCtaClick={() => onNavigate('shop')}
      priority
    />
  );
};
