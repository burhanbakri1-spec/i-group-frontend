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
    <section className="px-4 md:px-8 pb-4 pt-2">
      <motion.div 
        className="relative h-[68vh] min-h-[520px] md:h-[78vh] w-full max-w-[1440px] mx-auto overflow-hidden rounded-[20px] md:rounded-[24px] shadow-sm bg-[#FFFFFF]"
        {...heroReveal}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/34 via-black/5 to-transparent" />
        
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-4 md:px-6 text-center"
        >
          <motion.div>
            <div className="overflow-hidden mb-8 md:mb-10">
              <motion.h1 
                className="text-[42px] md:text-[84px] font-brand leading-[0.85] text-white lowercase drop-shadow-sm"
                initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.12,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {lang === 'en' ? heroHeadline : 'زبدة الحاجز'} <br /> {lang === 'en' ? 'butter.' : 'الواقي.'}
              </motion.h1>
            </div>
            
            <motion.button 
              onClick={() => onNavigate('shop')}
              className="bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-200 ease-out hover:bg-[#F0EDE8] hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.22,
                duration: 0.35,
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
