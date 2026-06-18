import React from 'react';
import { Language, translations } from '../translations';
import { useContent } from '../hooks/useContent';
import { useVerifiedImage } from '../hooks/useVerifiedImage';
import { PageHero } from './PageHero';

interface HeroProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  // BE ContentProvider keys — single source of truth. HeroService.onModuleInit
  // (in e-commerce-backend/src/modules/hero) registers `home.hero.image` with
  // a defaultValue so a fresh DB still serves a valid URL. Spec 005's
  // useSiteContent shim is intentionally NOT used here: its hardcoded literal
  // fallback masked BE failures (a 500 from `/api/v1/content/:key` would
  // silently render the old Unsplash photo, which made "the hero image isn't
  // updating" impossible to debug from the FE).
  const { val: homeHeroImageCp } = useContent('home.hero.image', { lang, fallback: '' });
  const { val: homeHeroHeadlineCp } = useContent('home.hero.headline', { lang, fallback: '' });
  const { val: homeHeroImageMobileCp } = useContent('home.hero.image.mobile', {
    lang,
    fallback: '',
  });
  const { val: homeHeroImageTabletCp } = useContent('home.hero.image.tablet', {
    lang,
    fallback: '',
  });
  const { val: homeHeroCtaCp } = useContent('home.hero.cta', {
    lang,
    fallback: '',
  });
  const { val: homeHeroSubtitleCp } = useContent('home.hero.subtitle', {
    lang,
    fallback: '',
  });

  // Pre-load each candidate URL with a hidden <Image> probe. The visible
  // <img> only receives the URL after the probe's onload fires — that
  // way the rendered hero image is guaranteed to be a URL the browser
  // actually decoded (no 404 flicker, no half-loaded frames).
  const desktop = useVerifiedImage(homeHeroImageCp);
  const mobile = useVerifiedImage(homeHeroImageMobileCp);
  const tablet = useVerifiedImage(homeHeroImageTabletCp);

  // Headline: BE content registry > translations.ts fallback (i18n).
  const headline = homeHeroHeadlineCp || t.pages.hero.fallbackTitle;
  const ctaLabel = homeHeroCtaCp || t.shopNow;

  // The hero image comes from the BE ONLY. The ultimate fallback
  // (network down + BE unreachable) is PageHero's `fallbackImage` prop.
  // Verified URLs come from the probe — non-verified candidates are
  // dropped so we never hand the <img> a broken URL.
  const desktopSrc = desktop.verified ? desktop.url : null;
  const mobileSrc = mobile.verified ? mobile.url : null;
  const tabletSrc = tablet.verified ? tablet.url : null;

  return (
    <PageHero
      image={desktopSrc ?? undefined}
      mobileImage={mobileSrc ?? undefined}
      tabletImage={tabletSrc ?? undefined}
      fallbackImage="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000"
      alt={t.pages.hero.imageAlt}
      title={headline}
      subtitle={homeHeroSubtitleCp || undefined}
      ctaLabel={ctaLabel}
      onCtaClick={() => onNavigate('shop')}
      priority
    />
  );
};