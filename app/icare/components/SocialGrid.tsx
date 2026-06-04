import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SwipeRail } from './ui/SwipeRail';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface SocialGridProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const SocialGrid: React.FC<SocialGridProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { socialGridHeading, socialGridCta, socialGridImage1, socialGridImage2, socialGridImage3, socialGridImage4 } = useSiteContent();

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
          onClick={() => onNavigate('vlog')}
          /* Rhode pill: 15.73px / 400 / 23.6px / 0.314px ls / uppercase. */
          className="relative hidden overflow-hidden rounded-full px-8 py-2 text-[15.73px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-[#67645E] shadow-[inset_0_0_0_1px_#67645E] transition-all duration-300 group hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 md:block"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.32 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
        >
          <motion.span
            className="absolute inset-0 bg-[#67645E]"
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.24 }}
          />
          <span className="relative z-10">{lang === 'en' ? socialGridCta : 'تابعنا على السوشيال'}</span>
        </motion.button>
      </div>

      <SwipeRail
        ariaLabel={lang === 'en' ? 'Social lifestyle images' : 'صور نمط الحياة الاجتماعية'}
        cursorLabel={lang === 'en' ? 'swipe' : 'اسحب'}
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
        onClick={() => onNavigate('vlog')}
        className="mt-8 w-full rounded-full border border-[#67645E]/20 py-4 text-[12.8px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-[#67645E] hover:bg-[#67645E]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB] md:hidden"
      >
        {lang === 'en' ? socialGridCta : 'تابعنا على السوشيال'}
      </button>
    </section>
  );
};
