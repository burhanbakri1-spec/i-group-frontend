import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface SocialGridProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

const SCROLL_BOUNDARY_THRESHOLD = 1;

export const SocialGrid: React.FC<SocialGridProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { socialGridHeading, socialGridCta, socialGridImage1, socialGridImage2, socialGridImage3, socialGridImage4 } = useSiteContent();

  const lifestyleImages = [
    { id: 1, src: socialGridImage1, alt: "icare lifestyle 1" },
    { id: 2, src: socialGridImage2, alt: "icare lifestyle 2" },
    { id: 3, src: socialGridImage3, alt: "icare lifestyle 3" },
    { id: 4, src: socialGridImage4, alt: "icare lifestyle 4" },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    scrollFrameRef.current = null;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const maxScrollLeft = Math.max(0, scrollContainer.scrollWidth - scrollContainer.clientWidth);
    const currentScrollLeft = Math.min(Math.max(scrollContainer.scrollLeft, 0), maxScrollLeft);
    const nextProgress = maxScrollLeft <= SCROLL_BOUNDARY_THRESHOLD
      ? 100
      : (currentScrollLeft / maxScrollLeft) * 100;

    setScrollProgress(nextProgress);
    setCanScrollLeft(currentScrollLeft > SCROLL_BOUNDARY_THRESHOLD);
    setCanScrollRight(currentScrollLeft < maxScrollLeft - SCROLL_BOUNDARY_THRESHOLD);
  }, []);

  const scheduleScrollStateUpdate = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    scheduleScrollStateUpdate();
    window.addEventListener('resize', scheduleScrollStateUpdate);

    return () => {
      window.removeEventListener('resize', scheduleScrollStateUpdate);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [scheduleScrollStateUpdate]);

  useEffect(() => {
    scheduleScrollStateUpdate();
  }, [socialGridImage1, socialGridImage2, socialGridImage3, socialGridImage4, scheduleScrollStateUpdate]);

  const getNextCardScrollLeft = useCallback((direction: 'left' | 'right') => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return 0;

    const maxScrollLeft = Math.max(0, scrollContainer.scrollWidth - scrollContainer.clientWidth);
    const currentScrollLeft = Math.min(Math.max(scrollContainer.scrollLeft, 0), maxScrollLeft);
    const cardPositions = Array.from(scrollContainer.children).map((child) => {
      const card = child as HTMLElement;
      return Math.min(Math.max(card.offsetLeft - scrollContainer.offsetLeft, 0), maxScrollLeft);
    });

    if (direction === 'right') {
      return cardPositions.find((position) => position > currentScrollLeft + SCROLL_BOUNDARY_THRESHOLD) ?? maxScrollLeft;
    }

    return [...cardPositions].reverse().find((position) => position < currentScrollLeft - SCROLL_BOUNDARY_THRESHOLD) ?? 0;
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      left: getNextCardScrollLeft(direction),
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
    scheduleScrollStateUpdate();
  };

  const handleScrollKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    scroll(event.key === 'ArrowLeft' ? 'left' : 'right');
  };

  return (
    <section className="px-4 md:px-8 py-4 md:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto bg-[#EDECEB] rounded-[12px] p-6 md:p-10 relative overflow-hidden">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <motion.h2 
            className="text-[28px] md:text-[36px] font-[900] tracking-tight text-[#67645E] lowercase"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32 }}
          >
            {socialGridHeading}
          </motion.h2>
          <motion.button 
            onClick={() => onNavigate('vlog')}
            className="hidden md:block border border-[#67645E]/20 rounded-full px-8 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[#67645E] hover:bg-[#67645E] hover:text-white transition-all duration-300 relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
          >
            <motion.span
              className="absolute inset-0 bg-[#67645E]"
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
          dir="ltr"
          role="region"
          aria-label="iCare + you image carousel"
          tabIndex={0}
          onScroll={scheduleScrollStateUpdate}
          onKeyDown={handleScrollKeyDown}
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pt-2 pb-6 snap-x snap-mandatory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
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
                  y: shouldReduceMotion ? 0 : -4
                }}
                className="flex-none w-[70%] md:w-[240px] lg:w-[280px] aspect-square rounded-[12px] overflow-hidden snap-start group"
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
        <div className="mt-2 pt-6 border-t border-[#DDDDDD] flex justify-between items-center">
          {/* Progress Line */}
          <div className="flex-1 h-[1px] bg-[#DDDDDD] relative mr-10">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-[#67645E]"
              initial={false}
              animate={{ width: `${scrollProgress}%` }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              aria-hidden="true"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3">
            <motion.button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll iCare + you left"
              className="w-12 h-12 rounded-full border border-[#DDDDDD] flex items-center justify-center text-[#67645E] transition-opacity disabled:cursor-not-allowed disabled:opacity-35 disabled:text-[#67645E]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
              whileHover={canScrollLeft ? { 
                backgroundColor: "rgba(103,100,94,0.06)"
              } : undefined}
              whileTap={shouldReduceMotion || !canScrollLeft ? undefined : { scale: 0.98 }}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </motion.button>
            <motion.button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll iCare + you right"
              className="w-12 h-12 rounded-full border border-[#DDDDDD] flex items-center justify-center text-[#67645E] transition-opacity disabled:cursor-not-allowed disabled:opacity-35 disabled:text-[#67645E]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
              whileHover={canScrollRight ? { 
                backgroundColor: "rgba(103,100,94,0.06)"
              } : undefined}
              whileTap={shouldReduceMotion || !canScrollRight ? undefined : { scale: 0.98 }}
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Social Button */}
        <button
          onClick={() => onNavigate('vlog')}
          className="md:hidden w-full mt-8 border border-[#67645E]/20 rounded-full py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#67645E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
        >
          {lang === 'en' ? socialGridCta : 'تابعنا على السوشيال'}
        </button>
      </div>
    </section>
  );
};
