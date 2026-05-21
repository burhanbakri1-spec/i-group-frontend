import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface HeroProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  const { heroHeadline, heroImage } = useSiteContent();
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  const imageY = useTransform(scrollY, [0, 500], [0, 48]);
  const heroReveal = shouldReduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } };
  
  return (
    <section className="bg-white px-4 md:px-8">
      <motion.div 
        className="relative h-[80vh] md:h-[85vh] w-full overflow-hidden shadow-sm"
        {...heroReveal}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          style={shouldReduceMotion ? undefined : { y: imageY }}
          className="absolute inset-0"
        >
          <ImageWithFallback 
            src={heroImage} 
            alt="Beautiful woman skincare aesthetic" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        
        {/* Warm minimal overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--rb-primary-text)]/20 via-[var(--rb-taupe-7B7872)]/5 to-transparent" />
        
        <div
          className="absolute inset-0 flex flex-col items-start justify-end pb-12 md:pb-20 px-6 md:px-10 text-left"
        >
          <motion.div>
            <div className="overflow-hidden mb-8 md:mb-10">
              <motion.h1 
                className="text-[42px] md:text-[84px] font-sans font-extrabold leading-[0.85] text-white lowercase drop-shadow-sm"
                initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.15,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {lang === 'en' ? heroHeadline : 'زبدة الحاجز'} <br /> {lang === 'en' ? 'butter.' : 'الواقي.'}
              </motion.h1>
            </div>
            
            <motion.button 
              onClick={() => onNavigate('shop')}
              className="bg-[var(--rb-primary-text)] text-[var(--rb-pure-white)] px-10 md:px-12 py-4 md:py-5 rounded-full text-[13px] md:text-[14px] font-medium shadow-lg transition-all duration-300 ease-out hover:bg-[var(--rb-gray-525252)] hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rb-primary-text)]/40"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.25,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              <span>{t.shopNow}</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
