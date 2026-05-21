import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface PromoSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { promoBadge, promoHeadline, promoDescription, promoCtaLabel, promoImage } = useSiteContent();
  return (
    <section className="px-4 md:px-8 py-4 md:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-[12px] bg-[#EDECEB]">
        
        {/* Left Side: Content Section */}
        <div className="flex flex-col justify-center p-8 sm:p-10 md:p-20 min-h-[420px] md:min-h-[680px]">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            <span
              className="text-[10px] md:text-[12px] font-bold tracking-[0.3em] uppercase text-[#84827E] mb-6 block"
            >
              {lang === 'en' ? promoBadge : 'وصول جديد'}
            </span>
            
            {/* Main Title - Lowercase and Bold */}
            <div className="overflow-hidden mb-8">
              <motion.h2 
                className="text-[42px] md:text-[64px] font-[900] leading-[0.95] tracking-[-0.04em] text-[#67645E] lowercase"
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
              className="text-[15px] md:text-[18px] leading-relaxed text-[#84827E] font-medium mb-10 md:mb-12 max-w-[92%]"
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
            <div className="flex flex-wrap gap-4">
              <motion.button 
                onClick={() => onNavigate('shop')}
                className="border-2 border-[#67645E] rounded-full px-12 py-4 text-[11px] font-[900] tracking-[0.15em] uppercase text-[#67645E] transition-all duration-200 ease-out cursor-pointer hover:bg-[#67645E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
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
        <motion.div 
          className="relative aspect-square md:aspect-auto h-full overflow-hidden group"
        >
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
      </div>
    </section>
  );
};
