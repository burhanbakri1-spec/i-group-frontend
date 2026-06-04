import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteContent } from '../hooks/useSiteContent';
import { Language } from '../translations';

interface PhilosophySectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { philosophyHeadline, philosophyText, philosophyCta, philosophyImage } = useSiteContent();
  return (
    <section className="icare-index-section icare-full-banner">
      <div className="icare-full-banner__media">
        <motion.div
          className="w-full h-full"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
viewport={{ once: false }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <ImageWithFallback 
            src={philosophyImage} 
            alt="icare clean product texture" 
            className="w-full h-full object-cover object-center"
            priority
          />
        </motion.div>
        <div className="icare-full-banner__shade" />
      </div>

      <div className="icare-full-banner__copy">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          className="m-0 text-[clamp(1.25rem,2.4vw,1.6rem)] font-bold leading-[1.4] tracking-normal text-white"
          style={{ fontFamily: 'var(--font-rektorat)' }}
        >
          {philosophyHeadline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.76, 0, 0.24, 1] }}
          className="m-0 max-w-2xl text-[15.73px] font-bold leading-[1.5] tracking-[0.02em] text-white/90 md:text-[15.73px]"
        >
          {philosophyText}
        </motion.p>

        <motion.button
          onClick={() => onNavigate('story')}
          aria-label={lang === 'en' ? philosophyCta : 'تعرف على قصة آي كير'}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.76, 0, 0.24, 1] }}
          className="relative isolate overflow-hidden rounded-full px-8 py-2.5 text-[15.73px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95)] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-white before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-px hover:text-[#67645E] hover:before:scale-y-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
        >
          {philosophyCta}
        </motion.button>
      </div>
    </section>
  );
};
