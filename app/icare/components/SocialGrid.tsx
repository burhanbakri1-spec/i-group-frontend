import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SwipeRail } from './ui/SwipeRail';
import { translations, Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface SocialGridProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

const FOCUS_VISIBLE_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

/** Rhode outline pill — fill rises from bottom on hover (matches mission / hero CTAs). */
const OUTLINE_PILL_BTN_CLASS = [
  'relative isolate overflow-hidden rounded-full border border-[#67645E]',
  'px-8 py-2.5 text-[15.73px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-[#67645E]',
  'transition-[color,transform,border-color] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
  'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full',
  'before:bg-[#67645E] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)]',
  'hover:-translate-y-px hover:border-[#67645E] hover:text-white hover:before:scale-y-100',
  FOCUS_VISIBLE_CLASS,
].join(' ');

export const SocialGrid: React.FC<SocialGridProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { socialGridHeading, socialGridCta, socialGridImage1, socialGridImage2, socialGridImage3, socialGridImage4 } = useSiteContent(lang);
  const t = translations[lang];
  const socialGridCtaLabel = socialGridCta.trim() || (lang === 'ar' ? 'تابعنا على السوشيال' : 'FIND US ON SOCIAL');

  const lifestyleImages = [
    { id: 1, src: socialGridImage1, alt: 'icare lifestyle 1' },
    { id: 2, src: socialGridImage2, alt: 'icare lifestyle 2' },
    { id: 3, src: socialGridImage3, alt: 'icare lifestyle 3' },
    { id: 4, src: socialGridImage4, alt: 'icare lifestyle 4' },
  ];

  return (
    <section className="icare-index-section bg-white">
      <div className="icare-section-header">
        <motion.h2
          className="icare-section-title"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.32 }}
        >
          {socialGridHeading}
        </motion.h2>
        <motion.button
          type="button"
          onClick={() => onNavigate('vlog')}
          className={`${OUTLINE_PILL_BTN_CLASS} hidden md:inline-flex items-center justify-center`}
          initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.32 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
        >
          {socialGridCtaLabel}
        </motion.button>
      </div>

      <SwipeRail
        ariaLabel={t.ui.socialLifestyleImages}
        cursorLabel={t.pages.landingShowcase.swipe}
        className="icare-social-rail"
        trackClassName="icare-social-rail__track"
      >
        {lifestyleImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              delay: shouldReduceMotion ? 0 : index * 0.05,
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="icare-social-rail__item"
          >
            <ImageWithFallback
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
            />
          </motion.div>
        ))}
      </SwipeRail>

      <button
        type="button"
        onClick={() => onNavigate('vlog')}
        className={`${OUTLINE_PILL_BTN_CLASS} mt-8 w-full py-4 md:hidden`}
      >
        {socialGridCtaLabel}
      </button>
    </section>
  );
};
