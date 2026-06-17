'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { useContent } from '../hooks/useContent';
import { ScrollReveal } from './ui/ScrollReveal';

type CommitmentItemId = 'mission' | 'philanthropy' | 'sustainability';

// Constrain translation keys to the specific entries this component reads from
// translations[lang]. `t.commitmentMission` etc. are all top-level string props.
type CommitmentTranslationsKey =
  | 'commitmentMission'
  | 'commitmentMissionDetail'
  | 'commitmissionCta'
  | 'commitmentPhilanthropy'
  | 'commitmentPhilanthropyDetail'
  | 'commitmentPhilanthropyCta'
  | 'commitmentSustainability'
  | 'commitmentSustainabilityDetail'
  | 'commitmentSustainabilityCta';

interface CommitmentItemDef {
  id: CommitmentItemId;
  titleKey: CommitmentTranslationsKey;
  detailKey: CommitmentTranslationsKey;
  ctaKey: CommitmentTranslationsKey;
  // CMS keys for the content provider layer.
  cpTitleKey: `home.commitment.${CommitmentItemId}.title`;
  cpDetailKey: `home.commitment.${CommitmentItemId}.detail`;
  cpCtaKey: `home.commitment.${CommitmentItemId}.cta`;
}

const COMMITMENT_ITEMS: CommitmentItemDef[] = [
  {
    id: 'mission',
    titleKey: 'commitmentMission',
    detailKey: 'commitmentMissionDetail',
    ctaKey: 'commitmissionCta',
    cpTitleKey: 'home.commitment.mission.title',
    cpDetailKey: 'home.commitment.mission.detail',
    cpCtaKey: 'home.commitment.mission.cta',
  },
  {
    id: 'philanthropy',
    titleKey: 'commitmentPhilanthropy',
    detailKey: 'commitmentPhilanthropyDetail',
    ctaKey: 'commitmentPhilanthropyCta',
    cpTitleKey: 'home.commitment.philanthropy.title',
    cpDetailKey: 'home.commitment.philanthropy.detail',
    cpCtaKey: 'home.commitment.philanthropy.cta',
  },
  {
    id: 'sustainability',
    titleKey: 'commitmentSustainability',
    detailKey: 'commitmentSustainabilityDetail',
    ctaKey: 'commitmentSustainabilityCta',
    cpTitleKey: 'home.commitment.sustainability.title',
    cpDetailKey: 'home.commitment.sustainability.detail',
    cpCtaKey: 'home.commitment.sustainability.cta',
  },
];

interface CommitmentSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

type CommitmentItem = {
  id: CommitmentItemId;
  title: string;
  detail: string;
  cta: string;
};

export const CommitmentSection: React.FC<CommitmentSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { commitmentImage } = useSiteContent(lang);
  // ContentProvider — BE provides the Unsplash URL as defaultValue
  // (registered in e-commerce-backend/src/modules/hero/hero.service.ts).
  const { val: commitmentImageCp } = useContent('home.commitment.image', {
    lang,
    fallback: '',
  });
  // ContentProvider — 9 keys: title + detail + cta per item.
  const { val: missionTitleCp } = useContent('home.commitment.mission.title', { lang, fallback: '' });
  const { val: missionDetailCp } = useContent('home.commitment.mission.detail', { lang, fallback: '' });
  const { val: missionCtaCp } = useContent('home.commitment.mission.cta', { lang, fallback: '' });
  const { val: philanthropyTitleCp } = useContent('home.commitment.philanthropy.title', { lang, fallback: '' });
  const { val: philanthropyDetailCp } = useContent('home.commitment.philanthropy.detail', { lang, fallback: '' });
  const { val: philanthropyCtaCp } = useContent('home.commitment.philanthropy.cta', { lang, fallback: '' });
  const { val: sustainabilityTitleCp } = useContent('home.commitment.sustainability.title', { lang, fallback: '' });
  const { val: sustainabilityDetailCp } = useContent('home.commitment.sustainability.detail', { lang, fallback: '' });
  const { val: sustainabilityCtaCp } = useContent('home.commitment.sustainability.cta', { lang, fallback: '' });

  const cpByItem: Record<CommitmentItemId, { title: string; detail: string; cta: string }> = {
    mission: { title: missionTitleCp, detail: missionDetailCp, cta: missionCtaCp },
    philanthropy: {
      title: philanthropyTitleCp,
      detail: philanthropyDetailCp,
      cta: philanthropyCtaCp,
    },
    sustainability: {
      title: sustainabilityTitleCp,
      detail: sustainabilityDetailCp,
      cta: sustainabilityCtaCp,
    },
  };

  const t = translations[lang];
  const scrollInInitialX = lang === 'ar' ? 10 : -10;
  const [activeId, setActiveId] = useState<CommitmentItemId>('mission');

  // Priority chain per item: CMS > settings > translations.ts EN fallback.
  const commitmentItems: CommitmentItem[] = COMMITMENT_ITEMS.map((item) => {
    const cp = cpByItem[item.id];
    return {
      id: item.id,
      title: cp.title || t[item.titleKey],
      detail: cp.detail || t[item.detailKey],
      cta: cp.cta || t[item.ctaKey],
    };
  });

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