import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { ScrollReveal } from './ui/ScrollReveal';

interface PromoSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { promoBadge, promoHeadline, promoDescription, promoCtaLabel, promoImage } = useSiteContent();
  return (
    <section className="icare-index-section icare-split-banner">
      <div className="contents">
        
        {/* Left Side: Content Section */}
        <div className="icare-split-banner__copy">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <span
              className="mb-6 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#84827E] md:text-[12px]"
            >
              {lang === 'en' ? promoBadge : 'وصول جديد'}
            </span>
            
            {/* Main Title - Lowercase and Bold */}
            <div className="overflow-hidden mb-8">
              <motion.h2 
                className="text-[clamp(1.5rem,2vw,2rem)] font-bold leading-[1.15] tracking-normal text-[#67645E]"
                initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                whileInView={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: 0.05,
                  duration: 0.42,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {lang === 'en' ? (
                  <>{promoHeadline}</>
                ) : (
                  <>احمرار <br /> صغير بارد</>
                )}
              </motion.h2>
            </div>
            
            {/* Description */}
            <motion.p 
              className="mx-auto mb-8 max-w-[34.5rem] text-[15px] font-medium leading-[1.5] text-[#84827E] md:text-[16px]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12, duration: 0.35 }}
            >
              {lang === 'en' 
                ? promoDescription
                : 'دفئي خديك مع Pocket Blush. لمسة من اللون الكريمي طويل الأمد الذي يحاكي الاحمرار الذي تحصلين عليه بعد الدخول من البرد.'
              }
            </motion.p>
            
            {/* Button Styling */}
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button 
                onClick={() => onNavigate('shop')}
                className="relative isolate overflow-hidden rounded-full px-8 py-2.5 text-[13px] font-bold uppercase text-[#67645E] shadow-[inset_0_0_0_1px_#67645E] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-[#67645E] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-px hover:text-white hover:before:scale-y-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.18, duration: 0.35 }}
              >
                <span>{lang === 'en' ? promoCtaLabel : 'بوكيت بلاش'}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Visual Section */}
        <ScrollReveal direction="right" viewportMargin="-100px">
          <motion.div className="icare-split-banner__media">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <ImageWithFallback 
              src={promoImage} 
              alt="icare Pocket Blush" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Subtle Overlay for Premium feel */}
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
        </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};
