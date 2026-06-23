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
  const { promoBadge, promoHeadline, promoDescription, promoCtaLabel, promoImage } = useSiteContent(lang);
  const promoFallbacks = {
    badge: promoBadge || 'New Arrival',
    headline: promoHeadline || 'chilly little flush',
    description: promoDescription || 'Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color that mimics the flush you get after stepping in from the cold.',
    cta: promoCtaLabel || 'POCKET BLUSH',
    image: promoImage || 'https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  };
  return (
    <section className="icare-index-section icare-split-banner rounded-[var(--icare-section-radius)] p-[var(--icare-section-inset)]">
      <div className="contents">
        
        {/* Left Side: Content Section */}
        <div className="icare-split-banner__copy">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <span
              className="mb-6 block text-[12.8px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-[#67645E] md:text-[12.8px]"
            >
              {lang === 'en' ? promoFallbacks.badge : 'وصول جديد'}
            </span>

            {/* Main Title - Lowercase, Swiss 400, ImageWithContent-h2 size */}
            <div className="overflow-hidden mb-8">
              <motion.h2
                className="text-[clamp(1.25rem,1.65vw,1.6rem)] font-bold leading-[1.2] tracking-[0.02em] lowercase text-[#67645E]"
                initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                whileInView={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
viewport={{ once: false }}
              transition={{
                delay: 0.05,
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1]
              }}
              >
                {lang === 'en' ? (
                  <>{promoFallbacks.headline}</>
                ) : (
                  <>احمرار <br /> صغير بارد</>
                )}
              </motion.h2>
            </div>

            {/* Description - system 12.8px / 400 / 19.2px / 0.256px rhythm */}
            <motion.p
              className="mx-auto mb-8 max-w-[34.5rem] text-[12.8px] font-bold leading-[1.5] tracking-[0.02em] text-[#67645E] md:text-[12.8px]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.12, duration: 0.35 }}
            >
              {lang === 'en'
                ? promoFallbacks.description
                : 'دفئي خديك مع Pocket Blush. لمسة من اللون الكريمي طويل الأمد الذي يحاكي الاحمرار الذي تحصلين عليه بعد الدخول من البرد.'
              }
            </motion.p>

            {/* Button - system pill 15.73px / 400 / 0.314px / uppercase */}
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => onNavigate('shop')}
                className="relative isolate overflow-hidden rounded-full border border-[#67645E] px-8 py-2.5 text-[15.73px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-[#67645E] transition-[color,transform,border-color] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-[#67645E] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-px hover:border-[#67645E] hover:text-white hover:before:scale-y-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
viewport={{ once: false }}
              transition={{ delay: 0.18, duration: 0.35 }}
              >
                <span>{lang === 'en' ? promoFallbacks.cta : 'بوكيت بلاش'}</span>
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
            viewport={{ once: false }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <ImageWithFallback
              src={promoFallbacks.image}
              alt="icare Pocket Blush"
              className="w-full h-full object-contain"
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
