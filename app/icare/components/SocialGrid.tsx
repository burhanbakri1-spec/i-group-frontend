import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface SocialGridProps {
  lang: Language;
}

export const SocialGrid: React.FC<SocialGridProps> = ({ lang }) => {
  const shouldReduceMotion = useReducedMotion();
  const { socialGridHeading, socialGridCta, socialGridImage1, socialGridImage2, socialGridImage3, socialGridImage4 } = useSiteContent();

  const lifestyleImages = [
    { id: 1, src: socialGridImage1, alt: "icare lifestyle 1" },
    { id: 2, src: socialGridImage2, alt: "icare lifestyle 2" },
    { id: 3, src: socialGridImage3, alt: "icare lifestyle 3" },
    { id: 4, src: socialGridImage4, alt: "icare lifestyle 4" },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="px-4 md:px-8 py-4 md:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto bg-[#F2F2F0] rounded-[16px] p-6 md:p-10 relative overflow-hidden">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <motion.h2 
            className="text-[28px] md:text-[36px] font-[900] tracking-tight text-[#222] lowercase"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32 }}
          >
            {socialGridHeading}
          </motion.h2>
          <motion.button 
            className="hidden md:block border border-[#222]/20 rounded-full px-8 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[#222] hover:bg-[#222] hover:text-white transition-all duration-300 relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F0]"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
          >
            <motion.span
              className="absolute inset-0 bg-[#222]"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.24 }}
            />
            <span className="relative z-10">{lang === 'en' ? socialGridCta : 'تابعنا على السوشيال'}</span>
          </motion.button>
        </div>

        {/* Horizontal Scrollable Grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory"
        >
          {lifestyleImages.map((image, index) => (
            <motion.div 
              key={image.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{
                  y: shouldReduceMotion ? 0 : -4,
                  boxShadow: "0 14px 28px rgba(0,0,0,0.1)"
                }}
                className="flex-none w-[70%] md:w-[240px] lg:w-[280px] aspect-square rounded-[16px] overflow-hidden snap-start group"
              >
              <div className="w-full h-full">
                <ImageWithFallback 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Navigation Area */}
        <div className="mt-2 pt-6 border-t border-[#222]/5 flex justify-between items-center">
          {/* Progress Line */}
          <div className="flex-1 h-[1px] bg-[#222]/10 relative mr-10">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-[#222] w-1/4"
              initial={{ width: "25%" }}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3">
            <motion.button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-[#222]/10 flex items-center justify-center text-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F0]"
              whileHover={{ 
                backgroundColor: "rgba(255,255,255,1)",
                boxShadow: "0 5px 14px rgba(0,0,0,0.08)"
              }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </motion.button>
            <motion.button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-[#222]/10 flex items-center justify-center text-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F0]"
              whileHover={{ 
                backgroundColor: "rgba(255,255,255,1)",
                boxShadow: "0 5px 14px rgba(0,0,0,0.08)"
              }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Social Button */}
        <button className="md:hidden w-full mt-8 border border-[#222]/20 rounded-full py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F0]">
          {lang === 'en' ? socialGridCta : 'تابعنا على السوشيال'}
        </button>
      </div>
    </section>
  );
};
