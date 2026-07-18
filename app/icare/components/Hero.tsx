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
      fallbackImage=""
      alt={t.pages.hero.imageAlt}
      title={heroHeadline}
      subtitle={heroSubtitle || undefined}
      ctaLabel={heroCta || undefined}
      onCtaClick={() => onNavigate('shop')}
      priority
      objectPosition="54% center"
    />
  );
};
