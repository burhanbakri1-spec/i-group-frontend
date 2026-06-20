'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { useContent } from '../hooks/useContent';
import { ScrollReveal } from './ui/ScrollReveal';

const COMMITMENT_ITEMS = [
  { id: 'mission' as const, titleKey: 'commitmentMission' as const, detailKey: 'commitmentMissionDetail' as const, ctaKey: 'commitmissionCta' as const },
  { id: 'philanthropy' as const, titleKey: 'commitmentPhilanthropy' as const, detailKey: 'commitmentPhilanthropyDetail' as const, ctaKey: 'commitmentPhilanthropyCta' as const },
  { id: 'sustainability' as const, titleKey: 'commitmentSustainability' as const, detailKey: 'commitmentSustainabilityDetail' as const, ctaKey: 'commitmentSustainabilityCta' as const },
];

interface CommitmentSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

type CommitmentItem = {
  id: 'mission' | 'philanthropy' | 'sustainability';
  title: string;
  detail: string;
  cta: string;
};

export const CommitmentSection: React.FC<CommitmentSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { commitmentImage } = useSiteContent(lang);
  // ContentProvider key — BE provides the Unsplash URL as defaultValue
  // (registered in e-commerce-backend/src/modules/hero/hero.service.ts).
  const { val: commitmentImageCp } = useContent('home.commitment.image', {
    lang,
    fallback: '',
  });
  const t = translations[lang];
  const scrollInInitialX = lang === 'ar' ? 10 : -10;
  const [activeId, setActiveId] = useState<CommitmentItem['id']>('mission');

  const commitmentItems: CommitmentItem[] = COMMITMENT_ITEMS.map((item) => ({
    id: item.id,
    title: t[item.titleKey],
    detail: t[item.detailKey],
    cta: t[item.ctaKey],
  }));

  const activeItem = commitmentItems.find((item) => item.id === activeId) ?? commitmentItems[0];

  return (
    <section dir={lang === 'ar' ? 'rtl' : 'ltr'} className="icare-index-section icare-mission-section">
      <div className="icare-mission-panel flex flex-col">
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 mb-6 max-w-[34rem] text-[clamp(1rem,1.4vw,1.25rem)] font-bold leading-[1.6] tracking-[0.02em] text-[#67645E]">
                {activeItem.detail}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('story')}
                className="relative isolate overflow-hidden rounded-full px-8 py-2.5 text-[15.73px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-[#67645E] shadow-[inset_0_0_0_1px_#67645E] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-[#67645E] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-px hover:text-white hover:before:scale-y-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F0ED]"
              >
                {activeItem.cta}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto">
          {commitmentItems.map((item, index) => (
            <motion.article
              key={item.id}
              onMouseEnter={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
              initial={shouldReduceMotion ? false : { opacity: 0, x: scrollInInitialX }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.05,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`border-t border-[#67645E]/20 py-[1.55rem] last:border-b cursor-pointer transition-colors duration-300 ${
                item.id === activeId ? 'text-[#3D3B38]' : 'text-[#67645E]'
              }`}
            >
              <h3 className={`m-0 text-[clamp(1.25rem,1.6vw,1.6rem)] font-bold lowercase leading-[1.5] tracking-normal transition-colors duration-300 ${
                item.id === activeId ? 'text-[#3D3B38]' : 'text-[#67645E]'
              }`}>
                {item.title}
              </h3>
            </motion.article>
          ))}
        </div>
      </div>

      <ScrollReveal direction="right" viewportMargin="-80px">
        <div className="icare-mission-image relative">
          <ImageWithFallback
            src={commitmentImageCp || commitmentImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </ScrollReveal>
    </section>
  );
};
